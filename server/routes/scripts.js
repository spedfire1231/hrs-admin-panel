const express = require("express");
const router = express.Router();
const Script = require("../models/Script");
const auth = require("../middleware/auth"); // твій JWT middleware

// GET /api/scripts
router.get("/", auth, async (req, res) => {
  try {
    const { role, email } = req.user;

    const filter = (role === "owner" || role === "admin")
      ? {}
      : { ownerEmail: email };

      // 🌍 ФІЛЬТР ПО МОВІ
    if (language) {
      filter.language = language;
    }

    const scripts = await Script.find(filter)
      .sort({ updatedAt: -1 })
      .select("_id name content language category ownerEmail updatedAt createdAt isActive tags usageCount lastUsed");

    res.json(scripts);
  } catch (e) {
    res.status(500).json({ message: "Failed to load scripts" });
  }
});

// UPDATE script
// PUT /api/scripts/:id
router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const { role, email } = req.user;

    const script = await Script.findById(id);
    if (!script) {
      return res.status(404).json({ message: "Script not found" });
    }

    // доступ: owner/admin або власник
    if (
      role !== "owner" &&
      role !== "admin" &&
      script.ownerEmail !== email
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    script.content = content;
    script.updatedAt = new Date();
    await script.save();

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: "Failed to update script" });
  }
});

// DELETE script
// DELETE /api/scripts/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { role, email } = req.user;

    const script = await Script.findById(id);
    if (!script) {
      return res.status(404).json({ message: "Script not found" });
    }

    if (
      role !== "owner" &&
      role !== "admin" &&
      script.ownerEmail !== email
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    await script.deleteOne();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: "Failed to delete script" });
  }
});

// CREATE script
// POST /api/scripts
router.post("/", auth, async (req, res) => {
  try {
    const { name, content = "", language = "en" } = req.body;
    const { email, role } = req.user;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Script name required" });
    }

    // тільки owner / admin / hr
    if (!["owner", "admin", "hr"].includes(role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const script = await Script.create({
      name: name.trim(),
      content,
      language,
      ownerEmail: email,
      isActive: true,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.json({ ok: true, script });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to create script" });
  }
});


module.exports = router;
