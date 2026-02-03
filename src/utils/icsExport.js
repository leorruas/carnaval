export const generateAndDownloadICS = (blocks) => {
    let ical = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Carnaval BH 2026//PT\n';
    blocks.forEach(block => {
        const [year, month, day] = block.data.split('-');
        const [hours, minutes] = (block.horario || '00:00').split(':');
        const startDate = `${year}${month}${day}T${hours}${minutes}00`;
        ical += 'BEGIN:VEVENT\n';
        ical += `DTSTART:${startDate}\n`;
        ical += `SUMMARY:${block.nome}\n`;
        ical += `LOCATION:${block.endereco}\n`;
        ical += 'END:VEVENT\n';
    });
    ical += 'END:VCALENDAR';
    const blob = new Blob([ical], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'carnaval-bh.ics';
    a.click();
};
