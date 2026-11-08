"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, useGSAP);

// Same curves as the reference site
CustomEase.create("out", ".16,1,.3,1");
CustomEase.create("inOut", ".76,0,.24,1");
CustomEase.create("inOutStrong", ".83,0,.17,1");

export { gsap, ScrollTrigger, SplitText, useGSAP };
