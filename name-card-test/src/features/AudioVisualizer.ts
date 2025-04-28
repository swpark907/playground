export class AudioVisualizer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private audioSource: AudioBufferSourceNode | MediaElementAudioSourceNode | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private isPlaying: boolean = false;
  private dataArray: Uint8Array | null = null;
  private bufferLength: number = 0;
  private isLooping: boolean = false;

  constructor(private fftSize: number = 2048) {
    this.initAudioContext();
  }

  private initAudioContext(): void {
    try {
      window.AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.fftSize;
      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);
      this.analyser.connect(this.audioContext.destination);
      
    } catch (error) {
      console.error('Web Audio API가 지원되지 않습니다:', error);
    }
  }

  public toggleLoop(): void {
    this.isLooping = !this.isLooping;
    if (this.audioSource) {
      if (this.audioSource instanceof AudioBufferSourceNode) {
        this.audioSource.loop = this.isLooping;
      } else if (this.audioSource instanceof MediaElementAudioSourceNode && this.audioSource.mediaElement) {
        this.audioSource.mediaElement.loop = this.isLooping;
      }
    }
  }

  public loopAudio(): void {
    if (this.audioSource) {
      if (this.audioSource instanceof AudioBufferSourceNode) {
        this.audioSource.loop = true;
      } else if (this.audioSource instanceof MediaElementAudioSourceNode && this.audioSource.mediaElement) {
        this.audioSource.mediaElement.loop = true;
      }
    }
    this.isLooping = true;
  }

  public async loadAudioFile(file: File): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // AudioContext가 없으면 초기화 시도
      if (!this.audioContext) {
        try {
          this.initAudioContext();
          console.log('AudioContext 자동 초기화됨');
        } catch (error) {
          reject(new Error('AudioContext 초기화 실패: ' + error));
          return;
        }
      }

      // 여전히 초기화되지 않았다면 오류 발생
      if (!this.audioContext) {
        reject(new Error('AudioContext 초기화에 실패했습니다.'));
        return;
      }

      const fileReader = new FileReader();

      fileReader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          this.audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
          resolve(true);
        } catch (error) {
          console.error('오디오 디코딩 실패:', error);
          reject(error);
        }
      };

      fileReader.onerror = (error) => {
        console.error('파일 읽기 오류:', error);
        reject(error);
      };

      fileReader.readAsArrayBuffer(file);
    });
  }

  public playAudio(): void {
    if (!this.audioContext || !this.audioBuffer || !this.analyser) return;

    // 이미 재생 중이라면 중지
    if (this.isPlaying) this.stopAudio();

    // 오디오 소스 생성 및 연결
    this.audioSource = this.audioContext.createBufferSource();
    this.audioSource.buffer = this.audioBuffer;
    this.audioSource.connect(this.analyser);
    
    // 재생 시작
    this.audioSource.start(0);
    this.isPlaying = true;
  }

  public stopAudio(): void {
    if (this.audioSource && this.isPlaying) {
      if ('stop' in this.audioSource) {
        this.audioSource.stop();
      } else if (this.audioSource instanceof MediaElementAudioSourceNode && this.audioSource.mediaElement) {
        this.audioSource.mediaElement.pause();
      }
      this.audioSource.disconnect();
      this.isPlaying = false;
    }
  }

  public getTimeData(): Uint8Array {
    if (!this.analyser || !this.dataArray) {
      return new Uint8Array(0);
    }
    
    // 파형 데이터 가져오기
    this.analyser.getByteTimeDomainData(this.dataArray);
    return this.dataArray;
  }

  public getFrequencyData(): Uint8Array {
    if (!this.analyser || !this.dataArray) {
      return new Uint8Array(0);
    }
    
    // 주파수 데이터 가져오기
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  public getBufferLength(): number {
    return this.bufferLength;
  }

  public getAudioDuration(): number {
    return this.audioBuffer ? this.audioBuffer.duration : 0;
  }

  public isAudioPlaying(): boolean {
    return this.isPlaying;
  }

  public setFFTSize(fftSize: number): void {
    if (this.analyser) {
      this.analyser.fftSize = fftSize;
      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);
    }
  }

  public resume(): void {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  public destroy(): void {
    this.stopAudio();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
    this.audioSource = null;
    this.audioBuffer = null;
    this.dataArray = null;
  }

  /**
   * AudioContext의 현재 상태를 반환합니다.
   * @returns {string} AudioContext의 상태 ('suspended', 'running', 'closed' 또는 'not initialized')
   */
  public getAudioContextState(): string {
    if (!this.audioContext) {
      return 'not initialized';
    }
    return this.audioContext.state;
  }
}
