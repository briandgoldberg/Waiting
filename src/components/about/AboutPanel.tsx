import Image from "next/image";

export function AboutPanel() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5 flex flex-col sm:flex-row gap-5 sm:items-start">
        <Image
          src="/about/brian.jpg"
          alt="Brian Goldberg"
          width={128}
          height={128}
          className="w-28 h-28 rounded-full object-cover object-top shrink-0 border border-[var(--border)]"
        />
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">About</h1>
            <p className="text-sm text-[var(--muted)] mt-1">
              Hi, I&rsquo;m Brian Goldberg — I built WaitingForPower.
            </p>
          </div>
          <a
            href="https://www.linkedin.com/in/briandeangoldberg/"
            target="_blank"
            rel="noreferrer"
            className="self-start text-sm underline text-[var(--accent)]"
          >
            Connect with me on LinkedIn
          </a>
        </div>
      </div>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5 flex flex-col gap-3 text-sm leading-relaxed">
        <p>
          By day I&rsquo;m a software product manager; on the side I&rsquo;m an amateur economist
          currently pursuing a master&rsquo;s in environmental economics. WaitingForPower sits at
          the intersection of both — a data problem (where is U.S. energy infrastructure actually
          stuck, and why?) in service of a policy argument I care a lot about.
        </p>
        <p>
          Politically, I&rsquo;d call myself moderate. I care deeply about the environment, but
          I&rsquo;m convinced the market offers some of our strongest tools for addressing
          it — if the incentives are actually pointed the right way. That&rsquo;s a big part of
          why this site frames permitting delay as a structural, bipartisan problem rather than a
          fight between fuel types: solar, gas, nuclear, and transmission all get stuck in the
          same bottlenecks, and fixing those bottlenecks is something people across the political
          spectrum can actually agree on.
        </p>
        <p>
          I&rsquo;m an active member of{" "}
          <a
            href="https://citizensclimatelobby.org/"
            target="_blank"
            rel="noreferrer"
            className="underline text-[var(--accent)]"
          >
            Citizens&rsquo; Climate Lobby
          </a>{" "}
          (CCL), and their focus on durable, market-based, bipartisan climate policy has
          influenced how I think about this project a great deal.
        </p>
      </section>
    </div>
  );
}
