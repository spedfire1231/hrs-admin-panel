const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Script = require("../models/Script");
const mongoose = require("mongoose");

// GET QUESTIONS
router.get("/", auth, async (req, res) => {
  try {
    const { language } = req.query;

    const filter = { category: "question" };
    if (language) filter.language = language;

    const items = await Script.find(filter).sort({ createdAt: 1 });
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: "Failed to load Questions" });
  }
});

// ✅ UPDATE QUESTIONS
router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // 🔒 базові перевірки
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Questions id" });
    }

    if (!content || typeof content !== "string") {
      return res.status(400).json({ message: "Content is required" });
    }

    // 🔍 оновлюємо тільки FAQ
    const result = await Script.updateOne(
      {
        _id: id,
        category: "question"
      },
      {
        $set: {
          content,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Questions not found" });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("QUESTIONS UPDATE ERROR:", err);
    return res.status(500).json({ message: "Failed to update Questions" });
  }
});

// ✅ DELETE QUESTIONS
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // 🔒 перевірка id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Questions id" });
    }

    // 🗑️ видаляємо тільки Questions
    const result = await Script.deleteOne({
      _id: id,
      category: "question"
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Questions not found" });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("QUESTIONS DELETE ERROR:", err);
    return res.status(500).json({ message: "Failed to delete Questions" });
  }
});

module.exports = router;
