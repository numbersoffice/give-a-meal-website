import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config({ path: "./.env.local" });

async function translateText(text, textKeyName, context, targetLang) {
  const apiKey = process.env.OPENAI_API_KEY;
  const endpoint = "https://api.openai.com/v1/chat/completions";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  const systemPrompt = `
  I translate dict keys from English to ${targetLang}. 
  
  I will translate text to match the following context:
  ${context}

  Provide me with the text to the path ${textKeyName} and I will translate it to ${targetLang}.

  I will make sure to preserve the tone, meaning, and length of the text.
  `;
  const userPrompt = text;

  const body = JSON.stringify({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2,
    max_tokens: 160,
  });

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: headers,
      body: body,
    });
    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content; // Assuming there is at least one translation
    } else {
      console.error("Translation failed or no translations returned:", data);
      return null;
    }
  } catch (error) {
    console.error("Error during translation:", error);
    return null;
  }
}

function createContextString(arr, currentIndex) {
  // Calculate start and end indices for context
  let start = Math.max(0, currentIndex - 3);
  let end = Math.min(arr.length, currentIndex + 4); // +4 because slice's end is exclusive

  // Adjust if near the start or end of the array
  if (currentIndex < 3) {
    end = Math.min(end + (3 - currentIndex), arr.length);
  }
  if (currentIndex > arr.length - 4) {
    start = Math.max(0, start - (3 - (arr.length - currentIndex - 1)));
  }

  // Extract the context elements
  const contextElements = arr.slice(start, end);

  // Remove the element at the current index
  const filteredContextElements = contextElements.filter((_, index) => {
    const globalIndex = start + index;
    return globalIndex !== currentIndex;
  });

  // Join the context elements to form the context string
  const contextString = filteredContextElements.join(", ");

  return contextString;
}

function jsonToArray(sourceFilePath) {
  const sourceDict = JSON.parse(fs.readFileSync(sourceFilePath, "utf8"));

  const flatten = (obj, prefix = "") => {
    return Object.keys(obj).reduce((acc, k) => {
      const pre = prefix.length ? prefix + "." : "";
      if (typeof obj[k] === "object" && obj[k] !== null) {
        acc = acc.concat(flatten(obj[k], pre + k));
      } else {
        acc.push(`${pre + k}:${obj[k]}`);
      }
      return acc;
    }, []);
  };

  return flatten(sourceDict);
}

async function updateDictionaryWithTranslations(
  sourceFilePath,
  targetFilePath
) {
  const sourceDict = JSON.parse(fs.readFileSync(sourceFilePath, "utf8"));
  let targetFileContent = fs.readFileSync(targetFilePath, "utf8");
  let targetDict = targetFileContent ? JSON.parse(targetFileContent) : {};
  let dictArray = jsonToArray(sourceFilePath);

  let isUpdated = false;

  var index = 0;

  const compareAndUpdate = async (source, target, basePath = "") => {
    for (const key of Object.keys(source)) {
      const newBasePath = basePath ? `${basePath}.${key}` : key;

      if (typeof source[key] === "object" && source[key] !== null) {
        if (!target[key]) target[key] = {};
        await compareAndUpdate(source[key], target[key], newBasePath);
      } else {
        if (target[key] === undefined) {
          console.log(
            `Missing key found: ${newBasePath}, adding and translating...`
          );
          const targetLang = path.basename(targetFilePath, ".json");

          // Use the surrounding keys as context for translation
          const context = createContextString(dictArray, index);

          const translation = await translateText(
            source[key],
            newBasePath,
            context,
            targetLang
          );
          if (translation) {
            target[key] = translation;
            isUpdated = true;
            index++;
          } else {
            console.error(`Translation failed for key: ${newBasePath}`);
          }
        }
      }
    }
  };

  await compareAndUpdate(sourceDict, targetDict);

  if (isUpdated) {
    fs.writeFileSync(targetFilePath, JSON.stringify(targetDict, null, 2));
    console.log(
      `Updated dictionary at ${targetFilePath} with missing translations.`
    );
  } else {
    console.log(`No updates required for ${targetFilePath}.`);
  }
}

function main() {
  const dictionariesPath = "./src/dictionaries";
  const sourceFileName = "en.json";
  const sourceFilePath = path.join(dictionariesPath, sourceFileName);

  fs.readdir(dictionariesPath, (err, files) => {
    if (err) {
      console.error("Error reading the dictionaries directory:", err);
      return;
    }

    files.forEach((file) => {
      if (file !== sourceFileName && file.endsWith(".json")) {
        const targetFilePath = path.join(dictionariesPath, file);
        updateDictionaryWithTranslations(sourceFilePath, targetFilePath).catch(
          console.error
        );
      }
    });
  });
}

main();
