import { useVoice } from '../hooks/useVoice';
import './VoiceButton.css';

export default function VoiceButton({
  children,
  voiceText,
  onClick,
  className = '',
  ...props
}) {
  const { speak } = useVoice();

  const handleClick = (e) => {
    if (voiceText) {
      speak(voiceText);
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button className={className} onClick={handleClick} {...props}>
      {children}
    </button>
  );
}
