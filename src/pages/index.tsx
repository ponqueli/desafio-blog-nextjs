import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import { getPrismicClient } from '../services/prismic';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser } from 'react-icons/fi';
import styles from './home.module.scss';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  }
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination: {next_page, results} }: HomeProps) {
  const [posts, setPosts] = useState(results);
  const [nextPage, setNextPage] = useState(next_page);

  const handleGetMorePosts = async (): Promise<void> => {
    const response = await fetch(nextPage);
    const data = await response.json();

    const formattedPosts = data.results.map((post: Post) => {
      return {
        ...post,
        first_publication_date: post.first_publication_date,
      };
    });

    setNextPage(data.next_page);
    setPosts([...posts, ...formattedPosts]);
  };

  return (
    <>
      <Head>
        <title>Posts | SpaceTraveling</title>
      </Head>
      <main className={styles.container}>
        <article className={styles.post}>
        {posts.map(post => (
          <Link key={post.uid} href={`/post/${post.uid}`}>
          <a>
            <h1>{post.data.title}</h1>
            <p>{post.data.subtitle}</p>
            <div className={styles.postCreation}>
              <time>
                <FiCalendar /> {format(parseISO(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </time>
              <p>
                <FiUser /> {post.data.author}
              </p>
            </div>
          </a>
        </Link>
        ))} 
          {nextPage && (
            <button
              type="button"
              onClick={handleGetMorePosts}
              >
              Carregar mais posts
            </button>
          )}
        </article>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps  = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('zehblog', {
    pageSize: 2,
    orderings: ['document.first_publication_date desc'],
  });

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: {
      postsPagination,
    },
    revalidate: 60 * 60 * 24, // 24 hours
  };
};
