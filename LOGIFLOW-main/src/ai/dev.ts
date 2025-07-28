
import { config } from 'dotenv';
config();

import '@/ai/flows/optimize-delivery-routes.ts';
import '@/ai/flows/analyze-shipping-documents.ts'; // This now contains chatWithShippingDocument
import '@/ai/flows/logistics-chatbot-flow.ts';
import '@/ai/flows/forecast-shipment-risk-flow.ts';
import '@/ai/flows/review-contract-flow.ts';
import '@/ai/flows/generate-document-flow.ts'; // Added new flow
