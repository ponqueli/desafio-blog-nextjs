import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { Fragment, useMemo } from 'react';
import { useRouter } from 'next/router';
import { ptBR } from 'date-fns/locale';
import { format, parseISO } from 'date-fns';

import { RichText } from 'prismic-dom';
import PrismicDOM from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();
  
  const readTime = useMemo(() => {
    let fullText = '';
    const readWordsPerMinute = 200;

    return post.data.content.reduce((previousValue, currentValue) => {
      fullText += currentValue.heading + PrismicDOM.RichText.asText(currentValue.body)
      return Math.ceil(fullText.split(/\s/g).length / readWordsPerMinute);
    }, 0)
  }, [post]);

  if (router.isFallback || !post) {
    return (
      <main className={styles.container}>
        <div className={`${styles.postContent} ${styles.loading}`}>
          <h1>Carregando...</h1>
        </div>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | SpaceTraveling</title>
      </Head>

      <img className={styles.banner} src={post.data.banner.url} alt="banner" />      

      <main className={styles.container}>
        <article className={styles.postContent}>
          <h1>{post.data.title}</h1>
          <div className={styles.postInfo}>
            <time>
              <FiCalendar /> {post.first_publication_date}
            </time>
            <p>
              <FiUser /> {post.data.author}
            </p>
            <time>
              <FiClock /> {readTime} min
            </time>
          </div>

          {post.data.content.map(({ heading, body }) => (
            <Fragment key={heading}>
              <h2>{heading}</h2>
              <div
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(body),
                }}
              />
            </Fragment>
          ))}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async (): Promise<any> => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType("zehblog", {});

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid
      }
    }
  })

  return {
    paths,
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});

  const response = await prismic.getByUID('zehblog', String(slug), {});

  const post = {
    first_publication_date: format(
      parseISO(response.first_publication_date),
      'dd MMM yyyy',
      { locale: ptBR, }
    ),
    uid: response.uid,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author:  response.data.author,
      content: response.data.content
    },
  };

  return {
    props: {
      post,
    },
    revalidate:  60 * 60 * 24, // ou //60 * 30, // 30 minutes
  }
};
