import delve from 'dlv';
import ErrorPage from 'next/error';
import Layout from '../components/layout';
import BlockManager from '../components/shared/BlockManager';
import { getData, getStrapiURL, handleRedirection } from '../utils';
import { getLocalizedParams } from '../utils/localize';

const Universals = ({ global, pageData, preview }) => {
  if (pageData === null) {
    return <ErrorPage statusCode={404} />;
  }

  const blocks = delve(pageData, 'attributes.blocks');
  return (
    <Layout global={global} pageData={pageData} type="pages" preview={preview}>
      {blocks && <BlockManager blocks={blocks} />}
    </Layout>
  );
};

export async function getStaticPaths() {
  const apiURL = getStrapiURL('/pages/');
  const res = await fetch(apiURL);
  const pages = await res.json();

  const paths = pages.data.map((page) => ({
    params: { slug: [page.attributes.slug], lang: 'en' },
  }));

  return { paths, fallback: false };
}

// This gets called on every request
export async function getStaticProps(context) {
  const { slug, locale } = getLocalizedParams(context.params);
  try {
    const data = getData(
      slug,
      locale,
      'page',
      'collectionType',
      context.preview
    );

    const res = await fetch(delve(data, 'data'));
    const json = await res.json();

    if (!json.data.length) {
      return handleRedirection(context.preview, null);
    }

    return {
      props: {
        pageData: json.data[0],
        preview: context.preview || null,
      },
    };
  } catch (error) {
    return {
      props: { pageData: null },
    };
  }
}

export default Universals;
