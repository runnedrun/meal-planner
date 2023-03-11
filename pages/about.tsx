import { Layout } from "@/components/layouts/Layout"
import { buildPrefetchHandler } from "@/views/view_builder/buildPrefetchHandler"
import { rootComponent } from "@/views/view_builder/component"
import Image from "next/image"
import Link from "next/link"
import duck from "@/public/images/duck.png"

const About = rootComponent(({ _context: { user } }) => {
  return (
    <Layout>
      <div className="flex flex-col px-2">
        <Image
          className="m-2 self-center"
          src="/images/library.png"
          alt="Two people reading in a library"
          width={600}
          height={400}
        />
        <h1 className="mt-6 mb-4 self-center text-3xl font-bold">
          The story of Yomuya
        </h1>
        <p className="my-2">
          We&apos;re,{" "}
          <a
            className="font-bold underline hover:decoration-2"
            href="http://freedavid.co/"
            target="_blank"
            rel="noopener noreferrer"
          >
            David Gaynor
          </a>{" "}
          and{" "}
          <a
            className="font-bold underline hover:decoration-2"
            href="https://pscoleman.me/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Patrick Coleman
          </a>
          , two friends who are both a little too obsessed with studying (but
          definitely not mastering) foreign languages – Spanish, Chinese,
          Japanese, Korean, and French.
        </p>
        <p className="my-2">
          One night while getting ready for bed, David had an idea to practice
          Chinese with his wife Xinqing. He&apos;d build a little program to
          translate Harry Potter sentence-by-sentence to Chinese so they could
          read together before going to sleep.
        </p>
        <p className="my-2">
          Meanwhile Patrick had been trying to learn Japanese for a few years,
          had read all the bilingual short story books at the Kinokuniya (the
          Japanese bookstore in town), and was getting defeated by real paper
          books and comics. He was starting to learn to code and wanted to work
          on something he&apos;d use every day.
        </p>
        <p className="my-2">
          One day on a catchup call, we realized we both wanted to work on the
          same project.
        </p>
        <p className="my-2">
          In a weekend, David and another friend built an initial prototype (and
          open sourced it). Patrick immediately started using it to read Haruki
          Murakami short stories. Then David and Patrick (receiving lots of help
          from David) started to build out the UI and key features.
        </p>
        <p className="my-2 font-bold">
          Three months later in March 2023, we launched Yomuya!
        </p>
        <p className="my-2">
          Studying another language? Piecing together a bunch of different
          learning tools? Want access to some super secret alpha features?{" "}
          <Link href="/contact" className="underline hover:decoration-2">
            Get in touch and tell us your story too!
          </Link>
        </p>
        <h2 className="mt-6 mb-4 self-center text-3xl font-bold">FAQs</h2>
        <h3 className="text-large font-bold">What is Yomuya?</h3>
        <p className="my-2">
          Yomuya is a language learning app where you learn by reading. Reading
          is one of the most effective ways to learn another language. And
          it&apos;s fun!
        </p>
        <h3 className="text-large font-bold">Ok, how does it work?</h3>
        <p className="my-2">
          Yomuya gives sentence-by-sentence translations for any text in any
          language. We&apos;ll give you machine translations (or bring your own
          human translation – coming soon!). And as you lookup unknown words,
          we&apos;ll automatically save them to study later.
        </p>
        <h3 className="text-large font-bold">Who&apos;s this for?</h3>
        <p className="my-2">
          Yomuya is ideal for intermediate learners who know basic grammar but
          are{" "}
          <a
            className="underline hover:decoration-2"
            href="https://www.quora.com/Is-it-true-that-if-you-learn-10-000-words-of-a-language-you-re-considered-fluent-in-it"
            target="_blank"
            rel="noopener noreferrer"
          >
            limited by their vocabularies
          </a>
          . Of course beginners and experts can use Yomuya too. We&apos;ve built
          features for both!
        </p>
        <h3 className="text-large font-bold">Is it free?</h3>
        <p className="my-2">
          For now (while Yomuya is in beta), everything is free. This may
          change. Get it while the getting&apos;s good!
        </p>
        <h3 className="text-large font-bold">
          Where does the name Yomuya come from?
        </h3>
        <div className="flex items-center justify-between">
          <p className="my-2 basis-10/12 md:basis-11/12">
            Yomuya comes from the Japanese &ldquo;yomu&rdquo; (読む), which
            means to read, and the Chinese &ldquo;ya&rdquo; (鴨), which means
            duck. Hence the cute ducks ;)
          </p>
          <Image
            className="h-16 w-16"
            src={duck}
            alt="Illustration of a duck with a book"
          />
        </div>
        <h3 className="text-large font-bold">But how do I say it?</h3>
        <p className="my-2">
          &ldquo;Yo&rdquo; like yo-yo 🪀 <br />
          &ldquo;mu&rdquo; like moo 🐮 <br />
          &ldquo;ya&rdquo; like yawn 🥱 <br />
          🪀 🐮 🥱
        </p>
        <h3 className="text-large font-bold">
          Why bother learning another language?
        </h3>
        <p className="my-2">
          Well if you have to ask, I suppose we&apos;ll answer...
        </p>
        <p className="my-2">
          In the slightly paraphrased words of{" "}
          <a
            className="underline hover:decoration-2"
            href="https://www.penguinrandomhouse.com/books/563587/making-sense-of-japanese-by-jay-rubin/"
            target="_blank"
            rel="noopener noreferrer"
          >
            teacher/translator Jay Rubin
          </a>
          , &ldquo;One of the most satisfying experiences a person can have is
          to train their mind to think in a foreign language.&rdquo;
        </p>
        <p className="my-2">
          Fancy! Couldn&apos;t have said it better ourselves.
        </p>
        <p className="my-2">
          Oh but of course we also do it for the people, food, travel, movies,
          games, TV, music and <span className="font-bold">BOOKS!</span>
        </p>
      </div>
    </Layout>
  )
})

export const getServerSideProps = buildPrefetchHandler()()

export default About
