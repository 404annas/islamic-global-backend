
import mongoose, { Schema } from "mongoose";

const progressSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ["present", "absent", "late"], required: true },
    timing: String,
    lesson: String,
    performance: { type: String, enum: ["excellent", "improving", "needs_work"] },
    remarks: String,
    addedBy: { type: Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export const Progress = mongoose.model("Progress", progressSchema);
