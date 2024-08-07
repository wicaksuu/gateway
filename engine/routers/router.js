// routes/index.js
const express = require("express");
const path = require("path");
const loadFunctions = require("./loadFunctions");

const router = express.Router();

const functionsDir = path.join(__dirname, "../../src");
const { functions, allFunctions } = loadFunctions(functionsDir);

router.get("/", async (req, res) => {
  const filteredFunctions = JSON.parse(JSON.stringify(functions));
  delete filteredFunctions.superAdmin;
  delete filteredFunctions.admin;
  delete filteredFunctions.engines;
  delete filteredFunctions.engine;
  res.status(200).json({ data: filteredFunctions });
});

const functionModules = {};

const loadFunctionModules = (currentObj, basePath) => {
  Object.keys(currentObj).forEach((key) => {
    if (key === "functions") {
      currentObj[key].forEach((func) => {
        const funcPath = path.join(basePath, func.name + ".js");
        functionModules[func.name] = require(funcPath);
      });
    } else {
      loadFunctionModules(currentObj[key], path.join(basePath, key));
    }
  });
};

loadFunctionModules(allFunctions, functionsDir);

router.post("/", async (req, res, next) => {
  const { query, params } = req.body;
  if (!query || !params) {
    return res.status(400).json({ message: "Query dan params harus ada" });
  }
  if (!functionModules[query]) {
    return res.status(404).json({ message: "Function not found" });
  }
  executeFunction(query, params, req, res, next);
});

const executeFunction = async (query, params, req, res, next) => {
  const func = functionModules[query];
  if (Object.keys(params).length !== func.params.length) {
    return res.status(203).json({ message: "Invalid parameters" });
  }

  req.body.params = params;

  const middlewares = [
    ...(func.middlewares || []),
    (req, res) => func.execute(req, res),
  ];

  const runMiddlewares = async (req, res, middlewares, index) => {
    if (index < middlewares.length) {
      const middleware = middlewares[index];
      await middleware(req, res, (err) => {
        if (err) return res.status(500).json({ message: "Server error" });
        runMiddlewares(req, res, middlewares, index + 1);
      });
    }
  };

  runMiddlewares(req, res, middlewares, 0);
};

module.exports = router;
