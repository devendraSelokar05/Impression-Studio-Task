const express = require("express");
const router = express.Router();

const { getKPIs, promotePartner } = require("../controllers/admin.controller");

router.get("/kpis", getKPIs);
router.put("/promote/:partnerId", promotePartner);

module.exports = router;
