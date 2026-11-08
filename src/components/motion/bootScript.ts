/**
 * Runs before first paint (via <InlineScript>):
 * - data-motion="on" unless the user prefers reduced motion
 * - data-intro="pending" on the first visit of the session, so the intro
 *   overlay covers the page before it paints
 */
export const bootScript = `(function(){try{var d=document.documentElement;var r=matchMedia('(prefers-reduced-motion: reduce)').matches;d.setAttribute('data-motion',r?'off':'on');d.setAttribute('data-js','');if(!r){var seen=null;try{seen=sessionStorage.getItem('sp-intro')}catch(e){}if(!seen)d.setAttribute('data-intro','pending')}}catch(e){}})();`;
