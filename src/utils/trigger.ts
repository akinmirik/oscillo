export interface TriggerOptions {
    level: number;
    slope: 'rising' | 'falling';
}

export function findTriggerPoint(
    data: Float32Array,
    options: TriggerOptions = { level: 0, slope: 'rising' }
): number {
    const { level, slope } = options;
    const hysteresis = 0.02; // Small buffer to prevent noise triggering

    // We search for the crossing point
    // Rising: previous < level && current >= level
    // Falling: previous > level && current <= level

    // Start a bit into the buffer to ensure we have previous data
    // and to avoid edge artifacts.
    // Also, we usually want to display the trigger point at the center or left.
    // Here we return the index of the trigger point.

    for (let i = 1; i < data.length - 1; i++) {
        const current = data[i];
        const prev = data[i - 1];

        if (slope === 'rising') {
            if (prev < level && current >= level) {
                // Check hysteresis (optional, but good for noise)
                // For simplicity, we just check the crossing.
                return i;
            }
        } else {
            if (prev > level && current <= level) {
                return i;
            }
        }
    }

    return -1; // No trigger found
}
