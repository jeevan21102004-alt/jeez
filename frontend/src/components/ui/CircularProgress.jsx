import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function CircularProgress({ value, text, color = '#43D9AD' }) {
  return (
    <CircularProgressbar
      value={value}
      text={text}
      styles={buildStyles({
        textColor: '#fff',
        pathColor: color,
        trailColor: 'rgba(255,255,255,0.08)',
      })}
    />
  );
}
