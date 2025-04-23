import React from 'react';
import './VolunteerHistory.css';

function getUrgencyClass(urgency) {
  if (urgency === 'High') return 'urgency-high';
  if (urgency === 'Medium') return 'urgency-medium';
  if (urgency === 'Low') return 'urgency-low';
  return '';
}

function VolunteerRow({ entry }) {
  return (
    <tr key={entry.id}>
      <td>{entry.eventName}</td>
      <td>{entry.location}</td>
      <td>{entry.eventDescription}</td>
      <td>
        <span className={getUrgencyClass(entry.urgency)}>{entry.urgency}</span>
      </td>
      <td>{entry.eventDate}</td>
      <td>{entry.participationStatus}</td>
    </tr>
  );
}

export default function VolunteerHistory() {
  const historyData = [
    {
      id: 1,
      eventName: 'Community Kitchen',
      eventDescription: 'Cooking meals for the homeless',
      location: 'Local Shelter',
      urgency: 'High',
      eventDate: '2025-03-15',
      participationStatus: 'Completed',
    },
  ];

  const tableHeaders = ['Event Name', 'Location', 'Description', 'Urgency', 'Event Date', 'Status'];

  return (
    <div className="volunteer-history-container">
      <h2>Volunteer History</h2>
      <table>
        <thead>
          <tr>
            {tableHeaders.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {historyData.map((entry) => (
            <VolunteerRow key={entry.id} entry={entry} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

