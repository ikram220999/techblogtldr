import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useParams } from 'react-router-dom';

// Helper to extract company name from URL
const getCompanyName = (url) => {
  try {
    const hostname = new URL(url).hostname;
    // Common mappings
    if (hostname.includes('grab.com')) return 'Grab';
    if (hostname.includes('uber.com')) return 'Uber';
    if (hostname.includes('apple.com')) return 'Apple';
    if (hostname.includes('google.com')) return 'Google';

    const parts = hostname.split('.');
    if (parts.length >= 2) {
      const raw = parts[parts.length - 2];
      return raw.charAt(0).toUpperCase() + raw.slice(1);
    }
    return hostname;
  } catch (e) {
    return 'Unknown';
  }
};

// Helper: check if date is within past 7 days
const isWithinPastWeek = (dateString) => {
  try {
    const cleanDateStr = dateString.split('|')[0].trim();
    const postDate = new Date(cleanDateStr);
    if (isNaN(postDate.getTime())) return false;

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - postDate.getTime());
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  } catch (e) {
    return false;
  }
};

function Feed() {
  const { companyId } = useParams();
  const targetCompany = companyId ? companyId.toLowerCase() : '';

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [displayCount, setDisplayCount] = useState(15);
  const observerTarget = useRef(null);

  useEffect(() => {
    setDisplayCount(15);
  }, [targetCompany]);

  useEffect(() => {
    if (!targetCompany) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    fetch(`/content/${targetCompany}-content.txt`)
      .then(res => {
        if (!res.ok) throw new Error("No articles available for this company.");
        return res.text();
      })
      .then(data => {
        const parsedPosts = [];
        const lines = data.trim().split('\n');

        lines.forEach(line => {
          if (!line.trim()) return;
          const parts = line.split(';');
          if (parts.length >= 4) {
            const postDate = parts[4] || '';
            const companyObj = companies.find(c => c.name.toLowerCase() === targetCompany);
            const companyDisplayName = companyObj ? companyObj.name : (targetCompany.charAt(0).toUpperCase() + targetCompany.slice(1));

            parsedPosts.push({
              title: parts[0],
              content: parts[1] || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
              url: parts[2],
              imgurl: parts[3],
              date: postDate,
              sourceCompany: companyDisplayName
            });
          }
        });

        setPosts(parsedPosts);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
        setPosts([]);
      });
  }, [targetCompany]);

  const displayedPosts = posts.slice(0, displayCount);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && displayCount < posts.length) {
          setDisplayCount(prev => prev + 15);
        }
      },
      { rootMargin: '100px' }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [displayCount, posts.length]);

  return (
    <main>
      <div className="mb-8 flex items-baseline justify-between mb-6 pb-2 border-b border-gray-100">
        <h1 className="text-xl font-bold tracking-tight">
          {targetCompany ? `${targetCompany.charAt(0).toUpperCase() + targetCompany.slice(1)} Stories` : 'Latest Stories'}
        </h1>
        <span className="text-xs text-gray-500 font-sans tracking-wide">UPDATED TODAY</span>
      </div>

      {loading && (
        <div className="py-10 text-sm text-gray-500">Loading...</div>
      )}

      {error && !loading && (
        <div className="py-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && posts.length === 0 && targetCompany && (
        <div className="py-10 text-sm text-gray-400">No articles available for this company.</div>
      )}

      {!loading && !error && !targetCompany && (
        <div className="py-10 text-sm text-gray-500">Please select a company from the sidebar to view their tech blog feed.</div>
      )}

      <div className="space-y-8">
        {displayedPosts.map((post, idx) => {
          const companyName = post.sourceCompany || getCompanyName(post.url);
          return (
            <article key={idx} className="group flex flex-col sm:flex-row gap-4 items-start">
              {post.imgurl && (
                <div className="w-full sm:w-32 aspect-video sm:aspect-auto sm:h-20 flex-shrink-0 bg-gray-100 overflow-hidden rounded-sm">
                  <img
                    src={post.imgurl}
                    alt={post.title}
                    loading="lazy"
                    className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 text-[11px] font-sans font-semibold text-gray-500 uppercase tracking-wide">
                  <span className="text-blue-600">{companyName}</span>
                  <span className="text-gray-300">&bull;</span>
                  <span className="font-medium">{post.date}</span>
                </div>
                <h2 className="text-base leading-tight mb-1.5 font-serif">
                  <a href={post.url} target="_blank" rel="noopener noreferrer" className="hover:underline focus:outline-none">
                    {post.title}
                  </a>
                </h2>
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed font-serif">{post.content}</p>
              </div>
            </article>
          );
        })}

        {!loading && !error && displayCount < posts.length && (
          <div ref={observerTarget} className="py-8 flex justify-center">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </main>
  );
}

const companies = [
  { name: 'Grab', icon: 'fas fa-car' },
  { name: 'Airbnb', icon: 'fab fa-airbnb' },
  // { name: 'Alibaba', icon: 'fas fa-shopping-cart' },
  // { name: 'Amazon', icon: 'fab fa-amazon' },
  // { name: 'AMD', icon: 'fas fa-microchip' },
  // { name: 'Anthropic', icon: 'fas fa-brain' },
  // { name: 'Apple', icon: 'fab fa-apple' },
  // { name: 'Atlassian', icon: 'fab fa-atlassian' },
  // { name: 'ByteDance', icon: 'fas fa-music' },
  // { name: 'Cloudflare', icon: 'fab fa-cloudflare' },
  // { name: 'Coinbase', icon: 'fas fa-coins' },
  // { name: 'Databricks', icon: 'fas fa-database' },
  // { name: 'Discord', icon: 'fab fa-discord' },
  // { name: 'Docker', icon: 'fab fa-docker' },
  // { name: 'Elastic', icon: 'fas fa-search' },
  // { name: 'Figma', icon: 'fab fa-figma' },
  // { name: 'GitHub', icon: 'fab fa-github' },
  // { name: 'GitLab', icon: 'fab fa-gitlab' },
  // { name: 'Google', icon: 'fab fa-google' },
  // { name: 'HashiCorp', icon: 'fas fa-cubes' },
  // { name: 'IBM', icon: 'fab fa-ibm' },
  // { name: 'Intel', icon: 'fas fa-microchip' },
  // { name: 'Meta', icon: 'fab fa-facebook' },
  // { name: 'Microsoft', icon: 'fab fa-microsoft' },
  // { name: 'MongoDB', icon: 'fas fa-leaf' },
  // { name: 'Netflix', icon: 'fas fa-film' },
  // { name: 'Netlify', icon: 'fas fa-code-branch' },
  // { name: 'Nvidia', icon: 'fas fa-server' },
  // { name: 'OpenAI', icon: 'fas fa-robot' },
  // { name: 'Oracle', icon: 'fas fa-database' },
  // { name: 'Pinterest', icon: 'fab fa-pinterest' },
  // { name: 'Reddit', icon: 'fab fa-reddit' },
  // { name: 'Redis', icon: 'fas fa-layer-group' },
  // { name: 'Robinhood', icon: 'fas fa-chart-line' },
  // { name: 'Salesforce', icon: 'fab fa-salesforce' },
  // { name: 'Shopify', icon: 'fab fa-shopify' },
  // { name: 'Slack', icon: 'fab fa-slack' },
  // { name: 'Snapchat', icon: 'fab fa-snapchat' },
  // { name: 'Snowflake', icon: 'fas fa-snowflake' },
  // { name: 'Spotify', icon: 'fab fa-spotify' },
  // { name: 'Stripe', icon: 'fab fa-stripe' },
  // { name: 'Supabase', icon: 'fas fa-bolt' },
  // { name: 'Tencent', icon: 'fas fa-gamepad' },
  // { name: 'Twitter', icon: 'fab fa-twitter' },
  // { name: 'Uber', icon: 'fab fa-uber' },
  // { name: 'Vercel', icon: 'fas fa-caret-up' },
  // { name: 'Zoom', icon: 'fas fa-video' }
];

function App() {
  return (
    <div className="min-h-screen bg-white text-black font-serif">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10 transition-colors">
        <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <i className="fa-solid fa-bolt text-sm"></i>
            <h1 className="text-sm font-bold tracking-tight">TechTLDR</h1>
          </Link>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <button className="hover:text-black transition-colors">
              Search
            </button>
            <button className="hover:text-black transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-10">

          {/* Sidebar */}
          <aside className="hidden md:block">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 custom-scrollbar">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Feed Sources</h2>
              <ul className="space-y-1.5">
                {companies.map((company, idx) => {
                  return (
                    <li key={idx}>
                      <Link
                        to={`/company/${company.name.toLowerCase()}`}
                        className="w-full flex items-center justify-between px-1.5 py-1 -ml-1.5 rounded-sm text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <i className={`${company.icon} text-gray-400 group-hover:text-black transition-colors min-w-[16px] text-center`}></i>
                          <span>{company.name}</span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* Router Content View */}
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/company/:companyId" element={<Feed />} />
          </Routes>

        </div>
      </div>
    </div>
  );
}

export default App;
