import { describe, it, expect } from "vitest";
import {
  mapMuscles,
  inferBodyRegion,
  inferMovementPattern,
  inferConditionNotes,
  inferEquipment,
  inferDifficulty,
  inferTrainingStyles,
  slugify,
  resolveExerciseDatasetMedia,
} from "@/lib/adapters/normalization";

describe("normalization heuristics", () => {
  describe("slugify", () => {
    it("should create clean URL slugs", () => {
      expect(slugify("Barbell Bench Press (Medium Grip)")).toBe("barbell-bench-press-medium-grip");
      expect(slugify("  Heavy-Duty Row  ")).toBe("heavy-duty-row");
    });
  });

  describe("mapMuscles", () => {
    it("should map various aliases accurately", () => {
      expect(mapMuscles(["pectoralis major clavicular"])).toContain("upper_chest");
      expect(mapMuscles(["front delt", "side delt"])).toEqual(["front_delts", "lateral_delts"]);
      expect(mapMuscles(["low back", "erector"])).toEqual(["spinal_erectors"]);
      expect(mapMuscles(["unrecognized"])).toEqual([]);
    });

    it("should handle messy input strings", () => {
      expect(mapMuscles(["  BICEP ", "triceps_muscle", null, undefined])).toEqual([
        "biceps",
        "triceps",
      ]);
    });
  });

  describe("inferBodyRegion", () => {
    it("should correctly classify major regions", () => {
      expect(inferBodyRegion(["upper_chest"], [])).toBe("chest");
      expect(inferBodyRegion(["front_delts"], ["triceps"])).toBe("shoulders");
      expect(inferBodyRegion(["lats"], ["biceps"])).toBe("back");
      expect(inferBodyRegion(["abs"], [])).toBe("core");
      expect(inferBodyRegion(["quads"], [])).toBe("legs");
    });
  });

  describe("inferEquipment", () => {
    it("should map raw equipment strings", () => {
      expect(inferEquipment(["Barbell", "Dumbbell"])).toEqual(["barbell", "dumbbell"]);
      expect(inferEquipment(["body only"])).toEqual(["bodyweight"]);
      expect(inferEquipment([])).toEqual(["other"]);
    });
  });

  describe("inferDifficulty", () => {
    it("should detect difficulty from text", () => {
      expect(inferDifficulty("Advanced Movement")).toBe("advanced");
      expect(inferDifficulty("Intermediate level")).toBe("intermediate");
      expect(inferDifficulty("")).toBe("beginner");
      expect(inferDifficulty(null)).toBe("beginner");
    });
  });

  describe("inferTrainingStyles", () => {
    it("should infer bodybuilding for major regions", () => {
      const styles = inferTrainingStyles("chest", ["dumbbell"], "strength");
      expect(styles).toContain("bodybuilding");
    });

    it("should infer calisthenics for bodyweight/rings", () => {
      const styles = inferTrainingStyles("legs", ["rings"], "strength");
      expect(styles).toContain("calisthenics");
    });

    it("should infer powerlifting for heavy barbell work", () => {
      const styles = inferTrainingStyles("legs", ["barbell"], "strength");
      expect(styles).toContain("powerlifting");
    });
  });

  describe("inferMovementPattern", () => {
    it("should correctly identify primary patterns", () => {
      expect(inferMovementPattern("chest", "strength", "Bench Press")).toBe("push");
      expect(inferMovementPattern("back", "strength", "Seated Row")).toBe("pull");
      expect(inferMovementPattern("legs", "strength", "Goblet Squat")).toBe("squat");
      expect(inferMovementPattern("legs", "strength", "RDL")).toBe("hinge");
    });

    it("should handle isolation overrides and edge cases", () => {
      expect(inferMovementPattern("arms", "strength", "Bicep Curl", ["biceps"])).toBe("isolation");
      expect(inferMovementPattern("arms", "strength", "Tricep Pressdown", ["triceps"])).toBe("isolation");
      expect(inferMovementPattern("back", "strength", "Straight Arm Pulldown", ["lats"])).toBe("isolation");
    });

    it("should respect compound overrides for arm exercises", () => {
      expect(inferMovementPattern("arms", "strength", "Tricep Dip", ["triceps"])).toBe("push");
      expect(inferMovementPattern("arms", "strength", "Close Grip Bench Press", ["triceps", "mid_chest"])).toBe("push");
    });

    it("should fallback to bodyRegion classification", () => {
      expect(inferMovementPattern("core", "strength", "Hanging Leg Raise")).toBe("core");
    });
  });

  describe("inferConditionNotes", () => {
    it("should apply 'caution' for scoliosis during axial loading", () => {
      const notes = inferConditionNotes({
        slug: "barbell-back-squat",
        name: "Barbell Back Squat",
        bodyRegion: "legs",
        equipment: ["barbell"],
        difficulty: "advanced",
        movementPattern: "squat",
      });
      const scoliosis = notes.find((n) => n.conditionId === "scoliosis");
      expect(scoliosis?.suitability).toBe("caution");
      expect(scoliosis?.note).toContain("Axial loading");
    });

    it("should apply 'suitable' for diabetes generally", () => {
      const notes = inferConditionNotes({
        slug: "bench-press",
        name: "Bench Press",
        bodyRegion: "chest",
        equipment: ["dumbbell"],
        difficulty: "beginner",
        movementPattern: "push",
      });
      const diabetes = notes.find((n) => n.conditionId === "diabetes");
      expect(diabetes?.suitability).toBe("suitable");
    });

    it("should apply 'caution' for pregnancy during supine work", () => {
      const notes = inferConditionNotes({
        slug: "flat-bench-press",
        name: "Flat Bench Press",
        bodyRegion: "chest",
        equipment: ["barbell"],
        difficulty: "intermediate",
        movementPattern: "push",
      });
      const pregnancy = notes.find((n) => n.conditionId === "pregnancy_postpartum");
      expect(pregnancy?.suitability).toBe("caution");
      expect(pregnancy?.note).toContain("Avoid supine positions");
    });
  });

  describe("resolveExerciseDatasetMedia", () => {
    it("should enforce .jpg for thumbnails and .gif for animations", () => {
      const media = resolveExerciseDatasetMedia("path/to/image.png", "path/to/video.mp4");
      expect(media.thumbnail).toBe("/media/exercises/images/image.jpg");
      expect(media.animation).toBe("/media/exercises/gifs/video.gif");
    });

    it("should fallback thumbnail to animation if image is missing", () => {
      const media = resolveExerciseDatasetMedia(undefined, "anim.gif");
      expect(media.thumbnail).toBe("/media/exercises/gifs/anim.gif");
      expect(media.animation).toBe("/media/exercises/gifs/anim.gif");
    });

    it("should include both in gallery if available", () => {
      const media = resolveExerciseDatasetMedia("img.jpg", "anim.gif");
      expect(media.gallery).toContain("/media/exercises/images/img.jpg");
      expect(media.gallery).toContain("/media/exercises/gifs/anim.gif");
      expect(media.gallery.length).toBe(2);
    });
  });
});
