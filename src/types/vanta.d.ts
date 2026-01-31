declare module 'vanta/dist/vanta.birds.min' {
    interface VantaBirdsOptions {
        el: HTMLElement;
        THREE: any;
        mouseControls?: boolean;
        touchControls?: boolean;
        gyroControls?: boolean;
        minHeight?: number;
        minWidth?: number;
        scale?: number;
        scaleMobile?: number;
        backgroundColor?: number;
        color1?: number;
        color2?: number;
        colorMode?: string;
        birdSize?: number;
        wingSpan?: number;
        speedLimit?: number;
        separation?: number;
        alignment?: number;
        cohesion?: number;
        quantity?: number;
    }

    interface VantaEffect {
        destroy: () => void;
        setOptions: (options: Partial<VantaBirdsOptions>) => void;
    }

    function BIRDS(options: VantaBirdsOptions): VantaEffect;
    export default BIRDS;
}
