import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import { FiCalendar, FiUser } from 'react-icons/fi';
import styles from './home.module.scss';

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

export default function Home() { //{ postsPagination: { next_page, results } }: HomeProps
  return (
    <>
      <Head>
        <title>Posts | SpaceTraveling</title>
      </Head>
      <main className={styles.container}>
        <article className={styles.post}>
          <Link href={`/post/test`}>
            <a>
              <h1>Titulo</h1>
              <p>Subtitulo</p>
              <div className={styles.postCreation}>
                <time>
                  <FiCalendar />
                  15 Mar 2021
                </time>
                <p>
                  <FiUser />
                  Autor
                </p>
              </div>
            </a>
          </Link>
        </article>
      </main>
    </>
  )
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient({});
//   // const postsResponse = await prismic.getByType(TODO);

//   // TODO
// };
