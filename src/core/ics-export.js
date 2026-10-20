// RFC 5545 iCalendar (.ics) generator for Agnee 2026 events and personal plan

function formatDateToICS(date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function cleanText(text) {
  if (!text) return '';
  return text.replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
}

export function generateEventICS(event, festVenue = 'Gati Shakti Vishwavidyalaya, Vadodara') {
  // If exact date is not configured yet, generate a placeholder festive reminder or fallback
  const now = new Date();
  const dtStamp = formatDateToICS(now);

  // We set a placeholder tentative slot or future date for calendar import
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 30); // 30 days ahead placeholder
  startDate.setHours(10, 0, 0, 0);
  const endDate = new Date(startDate.getTime() + 3 * 3600 * 1000);

  const dtStart = formatDateToICS(startDate);
  const dtEnd = formatDateToICS(endDate);

  const summary = `Agnee 2026: ${event.name}`;
  const description = `${event.tagline || ''}\\n${event.description || ''}\\n\\nVenue: ${event.schedule?.venueName || festVenue}\\nCategory: ${event.category}\\nOfficial site: ${location.origin}`;
  const locationText = `${event.schedule?.venueName || 'Oval Ground'}, ${festVenue}`;

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Agnee 2026//GSV Vadodara//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:agnee2026-${event.id}-${Date.now()}@gsv.ac.in`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${cleanText(summary)}`,
    `DESCRIPTION:${cleanText(description)}`,
    `LOCATION:${cleanText(locationText)}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  return icsLines.join('\r\n');
}

export function generatePlanICS(events, festVenue = 'Gati Shakti Vishwavidyalaya, Vadodara') {
  const now = new Date();
  const dtStamp = formatDateToICS(now);

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Agnee 2026 My Plan//GSV Vadodara//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  events.forEach((event, index) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 30 + (event.schedule?.day === 'Day 2' ? 1 : event.schedule?.day === 'Day 3' ? 2 : 0));
    startDate.setHours(10 + (index % 4) * 2, 0, 0, 0);
    const endDate = new Date(startDate.getTime() + 2 * 3600 * 1000);

    const dtStart = formatDateToICS(startDate);
    const dtEnd = formatDateToICS(endDate);

    const summary = `Agnee 2026: ${event.name}`;
    const description = `${event.tagline || ''}\\n${event.description || ''}\\n\\nVenue: ${event.schedule?.venueName || festVenue}\\nCategory: ${event.category}\\nOfficial site: ${location.origin}`;
    const locationText = `${event.schedule?.venueName || 'Oval Ground'}, ${festVenue}`;

    icsLines.push(
      'BEGIN:VEVENT',
      `UID:agnee2026-${event.id}-${index}@gsv.ac.in`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${cleanText(summary)}`,
      `DESCRIPTION:${cleanText(description)}`,
      `LOCATION:${cleanText(locationText)}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  });

  icsLines.push('END:VCALENDAR');
  return icsLines.join('\r\n');
}

export function downloadICSFile(icsContent, filename = 'agnee2026-event.ics') {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
