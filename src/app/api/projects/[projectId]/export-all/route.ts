import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import JSZip from 'jszip';
import { AudioProcessor } from '@/lib/audio/processor';
import { TrackSeparator } from '@/lib/audio/track-separator';

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const project = await db.project.findUnique({
      where: {
        id: params.projectId,
        userId,
      },
      include: {
        outputFiles: true,
      },
    });

    if (!project) {
      return new NextResponse('Project not found', { status: 404 });
    }

    // Create zip file
    const zip = new JSZip();

    // Create folders
    const videoFolder = zip.folder('Video');
    const atmosFolder = zip.folder('Dolby Atmos');
    const binauralFolder = zip.folder('Binaural');
    const tracksFolder = zip.folder('Separate Tracks');
    const midiFolder = zip.folder('MIDI');
    const sheetMusicFolder = zip.folder('Sheet Music');

    // Process and add files
    const processor = AudioProcessor.getInstance();
    const separator = TrackSeparator.getInstance();

    for (const file of project.outputFiles) {
      const response = await fetch(file.url);
      const arrayBuffer = await response.arrayBuffer();

      // Process for different formats
      const atmosBuffer = await processor.processImmersive(arrayBuffer, {
        immersive: {
          enabled: true,
          format: {
            type: 'dolby_atmos',
            channelLayout: '9.1.6',
            renderMode: 'objects'
          }
        }
      });

      const binauralBuffer = await processor.processImmersive(arrayBuffer, {
        immersive: {
          enabled: true,
          format: {
            type: 'binaural',
            channelLayout: 'stereo',
            binauralMode: 'hrtf'
          }
        }
      });

      // Separate tracks
      const separatedTracks = await separator.separateTracks(arrayBuffer);
      
      // Add to zip
      atmosFolder?.file(`${file.name}-atmos.wav`, atmosBuffer);
      binauralFolder?.file(`${file.name}-binaural.wav`, binauralBuffer);

      // Add separated tracks
      for (const [trackName, trackBuffer] of separatedTracks.entries()) {
        tracksFolder?.file(`${trackName}.wav`, trackBuffer);
      }

      // Generate and add MIDI
      const midiData = await processor.generateMIDI(arrayBuffer);
      midiFolder?.file(`${file.name}.mid`, midiData);

      // Generate and add sheet music
      const sheetMusic = await processor.generateSheetMusic(midiData);
      sheetMusicFolder?.file(`${file.name}.pdf`, sheetMusic);
    }

    // Generate zip file
    const zipBuffer = await zip.generateAsync({
      type: 'arraybuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 5 }
    });

    return new Response(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${project.name}-export.zip"`,
      },
    });
  } catch (error) {
    console.error('[EXPORT_ALL_ERROR]', error);
    return new NextResponse('Export failed', { status: 500 });
  }
}