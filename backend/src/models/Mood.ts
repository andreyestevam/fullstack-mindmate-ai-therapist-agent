import mongoose, { Schema, Document } from "mongoose";

export interface IMood extends Document {
    userId: mongoose.Types.ObjectId;
    score: number;
    note?: string;
    timestamp: Date;
    createdAt: Date;
    updatedAt: Date;
}

const moodSchema = new Schema<IMood>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    note: {
        type: String,
        trim: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    }, {
        timestamps: true,
    }
);

// Index to optimize queries for the user's mood entries
moodSchema.index({ userId: 1, timestamp: -1 });

const Mood = mongoose.model<IMood>("Mood", moodSchema);

export { Mood };