export const FEATURE_CATEGORIES = {
  VIDEO_GENERATION: {
    title: 'Video Generation',
    description: 'AI-powered music video creation',
    features: [
      {
        id: '8k_video',
        name: '8K Ultra HD Video',
        description: 'Generate ultra-high resolution 8K videos (processing time: 2-4 hours depending on system resources)',
        requirements: ['enterprise_subscription']
      },
      {
        id: '4k_hdr',
        name: '4K HDR Cinematic Video',
        description: 'Professional cinematic videos in 4K HDR',
        requirements: ['pro_subscription']
      },
      {
        id: 'animated_video',
        name: 'Animated Music Videos',
        description: 'Create fully animated music videos with AI-generated visuals',
        requirements: ['pro_subscription'],
        styles: ['2D animation', '3D animation', 'Motion graphics', 'Abstract visualization']
      },
      {
        id: 'social_vertical',
        name: 'Social Media Clips',
        description: 'Vertical 9:16 clips for social platforms',
        requirements: ['basic_subscription']
      }
    ]
  },

  VOICE_PROCESSING: {
    title: 'Voice Processing',
    description: 'Advanced vocal processing and harmony generation',
    features: [
      {
        id: 'harmony_generation',
        name: 'Advanced Harmony Generation',
        description: 'Create sophisticated vocal harmonies',
        requirements: ['pro_subscription'],
        harmonyTypes: [
          {
            name: 'Parallel',
            description: 'Harmony lines move in the same direction'
          },
          {
            name: 'Oblique',
            description: 'One line stays static while others move'
          },
          {
            name: 'Contrary',
            description: 'Harmony lines move in opposite directions'
          }
        ]
      },
      {
        id: 'voice_cloning',
        name: 'Voice Cloning & Synthesis',
        description: 'Clone and synthesize vocal performances',
        requirements: ['pro_subscription']
      }
    ]
  },

  AI_SUPPORT: {
    title: 'AI Assistant',
    description: 'Intelligent automated support system',
    features: [
      {
        id: 'real_time_assistance',
        name: 'Real-Time AI Support',
        description: 'Instant help and recommendations while you work',
        capabilities: [
          'Project optimization suggestions',
          'Real-time troubleshooting',
          'Feature recommendations',
          'Processing parameter optimization'
        ]
      },
      {
        id: 'workflow_optimization',
        name: 'Smart Workflow Assistant',
        description: 'AI-powered workflow optimization',
        capabilities: [
          'Custom workflow suggestions',
          'Processing chain optimization',
          'Resource usage optimization',
          'Quality-speed balance recommendations'
        ]
      },
      {
        id: 'learning_system',
        name: 'Adaptive Learning System',
        description: 'System that learns and improves from usage',
        capabilities: [
          'Processing quality improvement',
          'Error pattern recognition',
          'Style preference learning',
          'Performance optimization'
        ]
      }
    ]
  },

  AUDIO_RESTORATION: {
    title: 'Audio Restoration',
    description: 'Advanced audio cleanup and enhancement',
    features: [
      {
        id: 'noise_reduction',
        name: 'AI Noise Reduction',
        description: 'Advanced AI-powered noise removal',
        requirements: ['basic_subscription']
      },
      {
        id: 'audio_inpainting',
        name: 'Audio Inpainting',
        description: 'Repair damaged or missing audio sections',
        requirements: ['pro_subscription']
      },
      {
        id: 'quality_enhancement',
        name: 'Quality Enhancement',
        description: 'AI-powered audio quality improvement',
        requirements: ['basic_subscription']
      }
    ]
  },

  IMMERSIVE_AUDIO: {
    title: 'Immersive Audio',
    description: 'Spatial and immersive audio processing',
    features: [
      {
        id: 'dolby_atmos',
        name: 'Dolby Atmos 9.1.6',
        description: 'Professional Dolby Atmos mixing and export',
        requirements: ['pro_subscription']
      },
      {
        id: 'spatial_audio',
        name: 'Spatial Audio',
        description: 'Apple Spatial Audio and Sony 360 Reality Audio',
        requirements: ['pro_subscription']
      },
      {
        id: 'binaural',
        name: 'Binaural Processing',
        description: 'Immersive binaural audio processing',
        requirements: ['basic_subscription']
      }
    ]
  },

  EXPORT_OPTIONS: {
    title: 'Export Options',
    description: 'Comprehensive export capabilities',
    features: [
      {
        id: 'immersive_export',
        name: 'Immersive Audio Export',
        description: 'Export in various immersive formats',
        formats: [
          'Dolby Atmos (BWF ADM)',
          'Apple Spatial Audio',
          'Sony 360 Reality Audio',
          'Binaural Audio'
        ]
      },
      {
        id: 'video_export',
        name: 'Video Export',
        description: 'Multiple video export options',
        formats: [
          '8K Ultra HD',
          '4K HDR',
          '1080p',
          'Social Media Optimized'
        ]
      },
      {
        id: 'music_export',
        name: 'Music Export',
        description: 'Comprehensive music file export',
        formats: [
          'Individual Stems',
          'MIDI Files',
          'Sheet Music (PDF)',
          'Lead Sheets'
        ]
      }
    ]
  }
};