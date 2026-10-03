import type { Course } from "@/lib/catalogue";

/**
 * The order the rounds are played in, taken from the observed journeys in the
 * TikTok sample: 91% of posts open with the starter, and the most common
 * journeys run starter > main > dessert > drink.
 */
export const MISSION_ORDER: Course[] = [
  "starter",
  "main",
  "side",
  "dessert",
  "drink",
  "wildcard",
];

export const WILDCARD_COURSE: Course = "wildcard";

/** The mission without the optional wildcard round. */
export const CORE_COURSES: Course[] = MISSION_ORDER.filter(
  (course) => course !== WILDCARD_COURSE,
);

export function coursesFor(includeWildcard: boolean): Course[] {
  return includeWildcard ? MISSION_ORDER : CORE_COURSES;
}

export const COURSE_LABEL: Record<Course, string> = {
  starter: "Starter",
  main: "Main",
  side: "Side",
  dessert: "Dessert",
  drink: "Drink",
  wildcard: "Wildcard",
};

/** Short behavioural captions for the shopping-mission flow in step 1. */
export const COURSE_CAPTION: Record<Course, string> = {
  starter: "Shared opener",
  main: "Highest spend",
  side: "Low-cost add-on",
  dessert: "Indulgence peak",
  drink: "Premium swing",
  wildcard: "Impulse treat",
};
