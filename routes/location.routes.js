const express = require("express");
const router = express.Router();

const { addLocation, viewAllLocation, viewLocationById, updateLocation, deleteLocation } = require("../controllers/location.controller");

router.post("/addLocation", addLocation);
router.get("/viewAllLocation", viewAllLocation);
router.get("/viewLocationById/:id", viewLocationById);
router.put("/updateLocation/:id", updateLocation);
router.delete("/deleteLocation/:id", deleteLocation);

module.exports = router;
