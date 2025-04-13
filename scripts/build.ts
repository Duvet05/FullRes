import * as esbuild from 'esbuild';
import * as fs from 'fs/promises';
import * as path from 'path';

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const distDir = path.join(rootDir, 'dist');
const manifestSrc = path.join(rootDir, 'manifest.json');
const assetsSrc = path.join(rootDir, 'assets');
const popupHtmlSrc = path.join(srcDir, 'popup', 'popup.html');

async function build(watch: boolean = false) {
    try {
        console.log('Starting build process...');

        // Clean dist/ directory
        console.log('Cleaning dist/ directory...');
        await fs.rm(distDir, { recursive: true, force: true });
        await fs.mkdir(distDir, { recursive: true });

        // Bundle TypeScript with esbuild
        console.log('Bundling TypeScript...');
        const buildOptions: esbuild.BuildOptions = {
            entryPoints: [
                path.join(srcDir, 'background', 'background.ts'),
                path.join(srcDir, 'content', 'detectResolution.ts'),
                path.join(srcDir, 'popup', 'popup.ts'),
            ],
            outdir: distDir,
            bundle: true, // Enable bundling
            format: 'iife', // Chrome-compatible output
            target: ['chrome89', 'firefox92'], // Match Ultrawideo
            sourcemap: true,
            minify: !watch,
            logLevel: 'info',
            outExtension: { '.js': '.js' },
            entryNames: '[dir]/[name]',
        };

        if (watch) {
            const ctx = await esbuild.context(buildOptions);
            await ctx.watch();
            console.log('Watching for changes...');
        } else {
            await esbuild.build(buildOptions);
        }

        // Copy manifest.json
        console.log('Copying manifest.json...');
        await fs.copyFile(manifestSrc, path.join(distDir, 'manifest.json'));

        // Copy assets/
        console.log('Copying assets/...');
        await fs.cp(assetsSrc, path.join(distDir, 'assets'), { recursive: true });

        // Copy popup.html
        console.log('Copying popup.html...');
        await fs.copyFile(popupHtmlSrc, path.join(distDir, 'popup', 'popup.html'));

        console.log('Build completed successfully!');
    } catch (error) {
        console.error('Build failed:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

// Run build based on command-line args
const watch = process.argv.includes('--watch') || process.argv.includes('--dev');
build(watch);