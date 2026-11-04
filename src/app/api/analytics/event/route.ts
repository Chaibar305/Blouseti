import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/analytics/event : enregistre un événement analytique
 */
export async function POST(request: NextRequest) {
  try {
    let body: any = {};
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      const text = await request.text();
      body = text ? JSON.parse(text) : {};
    }

    const eventName = body.event_name || 'unknown_event';
    const metadata = body.metadata || {};

    const supabase = createAdminClient();
    await supabase.from('analytics_events').insert({
      event_name: eventName,
      metadata,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error logging analytics event:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * GET /api/analytics/event : retourne les statistiques agrégées pour le dashboard admin
 */
export async function GET() {
  try {
    const supabase = createAdminClient();

    // Nombre total de clics WhatsApp
    const { count: whatsappClicks, error: waError } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_name', 'whatsapp_click');

    // Nombre total de visites/événements
    const { count: totalEvents } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true });

    // Clics WhatsApp des 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: recentWaClicks } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_name', 'whatsapp_click')
      .gte('created_at', thirtyDaysAgo.toISOString());

    return NextResponse.json({
      success: true,
      whatsappClicks: whatsappClicks || 0,
      recentWhatsappClicks: recentWaClicks || whatsappClicks || 0,
      totalEvents: totalEvents || 0,
    });
  } catch (err: any) {
    console.error('Error fetching analytics stats:', err);
    return NextResponse.json({
      success: false,
      whatsappClicks: 0,
      recentWhatsappClicks: 0,
      totalEvents: 0,
    });
  }
}
