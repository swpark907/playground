import React, { useEffect } from 'react';

interface AudioVisualCardProps {
  // 오디오 소스 URL
  audioSrc?: string;
  // 명함 정보
  cardInfo: {
    name: string;
    title: string;
    company?: string;
    contact: string;
  };
}

const AudioVisualCard: React.FC<AudioVisualCardProps> = ({
    audioSrc,
    cardInfo
}) => {
    const [uploadedAudio, setUploadedAudio] = React.useState<string | null>(null);
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setUploadedAudio(url);
        }
    };

    // 컴포넌트가 언마운트될 때 생성된 URL 해제
    useEffect(() => {
        return () => {
            if (uploadedAudio) {
                URL.revokeObjectURL(uploadedAudio);
            }
        };
    }, [uploadedAudio]);

    return (
        <>   
        <div>
            <h1>Audio Visual Card</h1>
            {!audioSrc && !uploadedAudio && (
                <input 
                    type="file" 
                    accept="audio/*"
                    onChange={handleFileUpload}
                />
            )}
            <audio src={audioSrc || uploadedAudio || ''} controls />
            <div>
                <h2>{cardInfo.name}</h2>
                <h3>{cardInfo.title}</h3>
                <p>{cardInfo.company}</p>
                <p>{cardInfo.contact}</p>
            </div>
        </div>
        </>
    );
};

export default AudioVisualCard;
