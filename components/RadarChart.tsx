import React from 'react';
import {
  Radar,
  RadarChart as ReRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { PersonalityScores } from '../types';

interface Props {
  scores: PersonalityScores;
}

const RadarChart: React.FC<Props> = ({ scores }) => {
  const data = [
    { subject: '社交性', A: scores.sociability, fullMark: 5 },
    { subject: '論理性', A: scores.logic, fullMark: 5 },
    { subject: '知的好奇心', A: scores.curiosity, fullMark: 5 },
    { subject: '協調性', A: scores.cooperation, fullMark: 5 },
    { subject: '行動力', A: scores.action, fullMark: 5 },
  ];

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ReRadarChart
          cx="50%"
          cy="50%"
          outerRadius="65%"
          data={data}
          margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
        >
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
          />
          <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
          <Radar
            name="Personality"
            dataKey="A"
            stroke="#f472b6"
            strokeWidth={3}
            fill="#f472b6"
            fillOpacity={0.3}
          />
        </ReRadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChart;
