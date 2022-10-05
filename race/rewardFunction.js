import { Point } from "./engine/point.js";

export function reward(agentInfo, trackInfo) {
    // agentInfo is an object with the following properties:
    // - position: Point - the position of the agent
    // - rotation: number - the rotation of the agent
    // - waypointIndex: number - the index of the waypoint the agent passed last
    // - nextWaypointIndex: number - the index of the waypoint the agent is heading to
    // - distanceFromTrack: number - distance from the center of the track
    // - progressDelta: number - progress made since last reward
    // trackInfo is an object with the following properties:
    // - width: number - width of the track
    // - waypoints: Point[] - array of points representing the track waypoints
    // Change this function to implement your own reward function.

    if (agentInfo.distanceFromTrack > trackInfo.width) {
        return 0;
    }

    const waypoint = trackInfo.waypoints[agentInfo.waypointIndex];
    const nextWaypoint = trackInfo.waypoints[agentInfo.nextWaypointIndex];

    const waypointVector = new Point(nextWaypoint.x - waypoint.x, nextWaypoint.y - waypoint.y);
    const playerForward = new Point(Math.sin(agentInfo.rotation), -1 * Math.cos(agentInfo.rotation));
    const dot = waypointVector.dot(playerForward);
    const denom = waypointVector.magnitude() * playerForward.magnitude();
    const cosFowardToWaypoint = (denom === 0) ? 0 : dot / denom;

    if (cosFowardToWaypoint < Math.SQRT1_2) {
        return 0;
    }

    return Math.max(0, agentInfo.progressDelta);
}