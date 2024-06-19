// routes/loadFunctions.js
const fs = require("fs");
const path = require("path");

const loadFunctions = (dir) => {
  const functions = {};
  const allFunctions = {};

  const walk = (currentDir, currentObj, allFunctionsObj) => {
    const files = fs.readdirSync(currentDir);
    files.forEach((file) => {
      const fullPath = path.join(currentDir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (!currentObj[file]) {
          currentObj[file] = {};
        }
        if (!allFunctionsObj[file]) {
          allFunctionsObj[file] = {};
        }
        walk(fullPath, currentObj[file], allFunctionsObj[file]);
      } else if (file.endsWith(".js")) {
        const func = require(fullPath);
        if (!currentObj.functions) {
          currentObj.functions = [];
        }
        if (!allFunctionsObj.functions) {
          allFunctionsObj.functions = [];
        }
        currentObj.functions.push({
          name: func.name,
          description: func.description,
          params: func.params,
          paramTypes: func.paramTypes,
          sampleRequest: func.sampleRequest,
        });
        allFunctionsObj.functions.push({
          name: func.name,
          description: func.description,
          params: func.params,
          paramTypes: func.paramTypes,
          sampleRequest: func.sampleRequest,
        });
      }
    });
  };

  walk(dir, functions, allFunctions);

  return { functions, allFunctions };
};

module.exports = loadFunctions;
