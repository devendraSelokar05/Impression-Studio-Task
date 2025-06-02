const express = require("express");
const router = express.Router();

const { createCategory, getAllCategories, getCategoryById, updateCategory } = require("../controllers/categories.controller");

router.post("/createCategory", createCategory);
router.get("/getAllCategories", getAllCategories);
router.get("/getCategoryById/:id", getCategoryById);
router.put("/updateCategory/:id", updateCategory);

module.exports = router;
