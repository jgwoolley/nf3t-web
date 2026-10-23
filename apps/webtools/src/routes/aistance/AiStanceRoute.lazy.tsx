import { createLazyRoute } from "@tanstack/react-router";
import Nf2tHeader from "../../components/Nf2tHeader";

export const Route = createLazyRoute("/aistance")({
    component: AiStanceComponent,
})

function AiStanceComponent() {
    return (
        <>
            <Nf2tHeader to="/aistance" />
            <p>Hello! James the human here!</p>
            <p></p>
            <p>I know AI Usage is quite controversal, and for understandable reasons. AI is going to have a massive impact on our world, and I'm skeptical that it will be on the whole postive.</p>
            <p>I've been a developer for almost 10 years now, and I've got a chance to use a lot of different software / languages / tools. I've got a lot of opinions on how things are done, that's why I've developed so many tools, before and after AI.</p>
            <p>I was quite skeptical that AI would ever be able to do my job, and while it can't do my job entirely, I've been pleased at how much more I am able to do with it.</p>
            <p>Over the years, I've had a lot of ideas that I haven't had the time to implement, and now, with AI assistance, I am able to make them.</p>
            <p>I think everyone should be a bit skeptical a pet project of some random person on the internet. That's part of the reason I like to own/maintain the tools, that no trustworthy organization is maintaining.</p>
            <p>I can't promise that I've looked at every line of code here, not even every file. But I have strong opinions on security / safety / privacy</p>
            <p>I have designed (as much as possible) to develop tools in the most private way I know how: static web apps. I've been making these tools before AI was a huge thing.</p>
            <p>All the data your processing is in your own browser! It never leaves your machine.</p>
            <p>None of my tools have any telemetry. I assume GitHub / Cloudflare are probably collecting some amount of your information, but I'd trust some random person on the internet less than GitHub / Cloudflare.</p>
            <p>So that's my stance. Yes. I use AI. If that's a deal breaker for you I'm sorry. Thanks for showing some interest in an idea I thought was interesting.</p>
            <p>Thanks for listening to my little rant, and sorry if it was a bit scattered, but I thought it was important that this statement was only written by me and me alone.</p>
        </>
    );
}
