
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface Container {
  id: string;
  status: 'In Transit' | 'Delayed' | 'At Port' | 'Delivered';
  currentLocation: string;
  estimatedArrival: string;
  lastUpdated: string;
}

// In-memory store for mock data
let mockContainers: Container[] = [
  { id: 'CONU1234567', status: 'In Transit', currentLocation: 'Mid-Pacific Ocean', estimatedArrival: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], lastUpdated: new Date().toISOString() },
  { id: 'CONU7654321', status: 'At Port', currentLocation: 'Port of Singapore', estimatedArrival: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], lastUpdated: new Date().toISOString() },
  { id: 'CONU2345678', status: 'Delayed', currentLocation: 'Suez Canal', estimatedArrival: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], lastUpdated: new Date().toISOString() },
  { id: 'CONU8888888', status: 'In Transit', currentLocation: 'Atlantic Crossing', estimatedArrival: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], lastUpdated: new Date().toISOString() },
];

const mockLocations = [
  "Shanghai, CN", "Singapore, SG", "Rotterdam, NL", "Los Angeles, US",
  "Busan, KR", "Antwerp, BE", "Suez Canal Transit", "Panama Canal Transit",
  "Mid-Atlantic", "Pacific Crossing", "Indian Ocean Passage", "Approaching Destination Port"
];
const mockStatuses: Container['status'][] = ['In Transit', 'At Port', 'Delayed', 'Delivered'];

function simulateDataUpdate() {
  if (mockContainers.length === 0) return;

  const randomIndex = Math.floor(Math.random() * mockContainers.length);
  const containerToUpdate = { ...mockContainers[randomIndex] };

  if (containerToUpdate.status === 'Delivered' && Math.random() < 0.8) { // Less chance to update delivered
      mockContainers[randomIndex].lastUpdated = new Date().toISOString();
      return;
  }
  
  // 30% chance to change status
  if (Math.random() < 0.3) {
       containerToUpdate.status = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];
  }
  
  containerToUpdate.currentLocation = containerToUpdate.status === 'Delivered' ? containerToUpdate.currentLocation : mockLocations[Math.floor(Math.random() * mockLocations.length)];
  
  let newEstimatedArrivalDate = new Date(containerToUpdate.estimatedArrival);
  if (containerToUpdate.status !== 'Delivered' && containerToUpdate.status !== 'Delayed' && Math.random() < 0.3) {
    newEstimatedArrivalDate.setDate(newEstimatedArrivalDate.getDate() + (Math.random() > 0.5 ? 1 : -1));
  } else if (containerToUpdate.status === 'Delayed' && Math.random() < 0.5) {
       newEstimatedArrivalDate.setDate(newEstimatedArrivalDate.getDate() + Math.floor(Math.random()*3) + 1);
  }

  if (containerToUpdate.status === 'Delivered') {
      newEstimatedArrivalDate = new Date(); // Set ETA to now if delivered
  }
  containerToUpdate.estimatedArrival = newEstimatedArrivalDate.toISOString().split('T')[0];
  containerToUpdate.lastUpdated = new Date().toISOString();
  
  mockContainers[randomIndex] = containerToUpdate;
}


export async function GET(request: NextRequest) {
  try {
    // Simulate some data change
    simulateDataUpdate();
    return NextResponse.json(mockContainers);
  } catch (e: unknown) { // Explicitly type 'e' as unknown for robust error handling
    console.error("Error in /api/tracking GET (route handler):", e);
    
    let errorMessage = "An unexpected error occurred in the tracking API.";
    let errorDetails = "No further details available.";

    if (e instanceof Error) {
      errorMessage = e.message;
      errorDetails = e.stack || "No stack trace.";
    } else if (typeof e === 'string') {
      errorMessage = e;
    } else if (e && typeof e === 'object' && 'toString' in e) {
      errorMessage = e.toString();
    }
    
    console.error("Parsed error details for tracking API:", errorDetails);
    // Return a 500 error as this catch block is for errors within the handler logic
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}

