'use server';

import { testGoogleSheetsConnection, syncAllOrdersToSheet } from '@/lib/googleSheets';

/**
 * Server Action pour tester l'accès au classeur Google Sheets
 */
export async function testGoogleSheetsAction(
  sheetId: string,
  serviceAccountJson?: string
): Promise<{ success: boolean; title?: string; error?: string }> {
  return await testGoogleSheetsConnection(sheetId, serviceAccountJson);
}

/**
 * Server Action pour synchroniser toutes les commandes vers Google Sheets
 */
export async function syncAllOrdersToGoogleSheetsAction(): Promise<{
  success: boolean;
  count?: number;
  error?: string;
}> {
  return await syncAllOrdersToSheet();
}
