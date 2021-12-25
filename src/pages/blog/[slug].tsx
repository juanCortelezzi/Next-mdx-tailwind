import type { NextPage } from "next";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import type { IPostFrontMatter } from "@lib/types";
import Head from "next/head";
import fs from "fs";
import jspath from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import prism from "remark-prism";
import Layout from "@components/layout";
import getComponents from "@components/posts";
import { postFilePaths, POSTS_PATH } from "@lib/mdx";

interface IProps {
  source: MDXRemoteSerializeResult;
  fmatter: IPostFrontMatter;
  heavyComponents: string[];
}

const Post: NextPage<IProps> = ({ source, fmatter, heavyComponents }) => {
  return (
    <Layout title={`Bleeding-blog: ${fmatter.title}`} desc={fmatter.desc}>
      <Head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/prismjs@1.25.0/themes/prism-tomorrow.css"
          key="prism-theme"
        />
      </Head>
      <h1 className="text-4xl font-bold">{fmatter.title}</h1>
      <main>
        <MDXRemote {...source} components={getComponents(heavyComponents)} />
      </main>
    </Layout>
  );
};

export const getStaticProps = async ({
  params,
}: {
  params: { slug: string };
}) => {
  const postFilePath = jspath.join(POSTS_PATH, `${params.slug}.mdx`);
  const source = fs.readFileSync(postFilePath);
  const { content, data } = matter(source);

  const heavyComponents = [/<Img/.test(content) ? "Img" : null].filter(
    Boolean
  ) as string[];

  const mdxSource = await serialize(content, {
    // Optionally pass remark/rehype plugins
    mdxOptions: {
      remarkPlugins: [prism],
      rehypePlugins: [],
    },
    scope: data,
  });

  return {
    props: {
      source: mdxSource,
      fmatter: data as IPostFrontMatter,
      heavyComponents,
    },
  };
};

export const getStaticPaths = async () => {
  const paths = postFilePaths
    // Remove file extensions for page paths
    .map((path) => path.replace(/\.mdx?$/, ""))
    // Map the path into the static paths object required by Next.js
    .map((slug) => ({ params: { slug } }));

  return {
    paths,
    fallback: false,
  };
};

export default Post;
