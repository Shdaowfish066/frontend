import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type User = {
  id: string;
  username: string;
  email: string;
  avatar: string;
  createdAt: string;
  totalPosts: number;
  totalVotesGiven: number;
};

export type FileAttachment = {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
};

export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  votes: number;
  userVote: 0 | 1 | -1;
};

export type Post = {
  id: string;
  communityId?: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  anonymous: boolean;
  title: string;
  content: string;
  votes: number;
  userVote: 0 | 1 | -1;
  comments: Comment[];
  files: FileAttachment[];
  createdAt: string;
  reported: boolean;
};

export type Community = {
  id: string;
  name: string;
  description: string;
  captainId: string;
  captainName: string;
  memberCount: number;
  members: { id: string; username: string; avatar: string; role: 'captain' | 'member' }[];
  joined: boolean;
  createdAt: string;
  color: string;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  file?: FileAttachment;
};

export type Conversation = {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  online: boolean;
  lastMessage: string;
  lastMessageAt: string;
  messages: Message[];
};

export type Report = {
  id: string;
  contentType: 'Post' | 'User';
  contentId: string;
  reason: string;
  reporterId: string;
  reporterName: string;
  createdAt: string;
  status: 'Pending' | 'Resolved';
};

type AppContextType = {
  currentUser: User;
  posts: Post[];
  communities: Community[];
  conversations: Conversation[];
  reports: Report[];
  isAuthenticated: boolean;
  setIsAuthenticated: (v: boolean) => void;
  createPost: (data: Partial<Post>) => Post;
  updatePost: (id: string, data: Partial<Post>) => void;
  deletePost: (id: string) => void;
  votePost: (id: string, vote: 1 | -1) => void;
  addComment: (postId: string, content: string) => Comment;
  voteComment: (postId: string, commentId: string, vote: 1 | -1) => void;
  deleteComment: (postId: string, commentId: string) => void;
  createCommunity: (data: Partial<Community>) => Community;
  joinCommunity: (id: string) => void;
  leaveCommunity: (id: string) => void;
  sendMessage: (conversationId: string, content: string, file?: FileAttachment) => void;
  resolveReport: (id: string) => void;
  dismissReport: (id: string) => void;
  reportContent: (contentType: 'Post' | 'User', contentId: string, reason: string) => void;
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();

const CURRENT_USER: User = {
  id: 'u1',
  username: 'NebulaUser',
  email: 'nebula@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nebula&backgroundColor=6C63FF',
  createdAt: daysAgo(90),
  totalPosts: 14,
  totalVotesGiven: 87,
};

const MOCK_USERS = [
  { id: 'u2', username: 'StargazerX', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=stargaze&backgroundColor=22C55E' },
  { id: 'u3', username: 'CosmicDrift', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cosmic&backgroundColor=38BDF8' },
  { id: 'u4', username: 'VoidWalker', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=void&backgroundColor=F59E0B' },
  { id: 'u5', username: 'QuantumLeap', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=quantum&backgroundColor=EF4444' },
];

const INITIAL_POSTS: Post[] = [
  {
    id: 'p1', communityId: 'c1', authorId: 'u2', authorName: 'StargazerX',
    authorAvatar: MOCK_USERS[0].avatar, anonymous: false,
    title: 'Building a real-time collaborative code editor with WebSockets',
    content: 'I\'ve been working on a real-time collaborative code editor for the past few weeks and wanted to share my progress. The core challenge was handling operational transforms to merge concurrent edits without conflicts. I ended up using the Yjs CRDT library which made synchronization much smoother.\n\nThe backend is built on Node.js with Socket.IO handling the WebSocket connections. Each document is stored in Redis with pub/sub for multi-server support. The frontend uses CodeMirror 6 which has excellent extension support.\n\nHappy to answer any questions about the architecture or specific implementation details!',
    votes: 247, userVote: 0,
    comments: [
      { id: 'cmt1', postId: 'p1', authorId: 'u3', authorName: 'CosmicDrift', authorAvatar: MOCK_USERS[1].avatar, content: 'This is incredible! I\'ve been struggling with the same conflict resolution issues. Did you consider using OTJSON instead of Yjs?', createdAt: hoursAgo(2), votes: 12, userVote: 0 },
      { id: 'cmt2', postId: 'p1', authorId: 'u4', authorName: 'VoidWalker', authorAvatar: MOCK_USERS[2].avatar, content: 'The Redis pub/sub approach is smart. How are you handling reconnection scenarios when a client drops momentarily?', createdAt: hoursAgo(1), votes: 8, userVote: 0 },
    ],
    files: [{ id: 'f1', name: 'architecture-diagram.png', size: 245000, type: 'image/png' }],
    createdAt: hoursAgo(5), reported: false,
  },
  {
    id: 'p2', communityId: undefined, authorId: 'u3', authorName: 'CosmicDrift',
    authorAvatar: MOCK_USERS[1].avatar, anonymous: false,
    title: 'Why I switched from Tailwind to vanilla CSS (and back again)',
    content: 'After 6 months of fighting Tailwind in a large team environment, I decided to try a pure CSS modules approach. Here\'s what I learned:\n\nThe good: Much cleaner component markup, easier to extract design tokens, better IDE support for complex styles.\n\nThe bad: Re-inventing utility classes constantly, inconsistent spacing across the team, way longer PR review cycles for style changes.\n\nI\'ve since come back to Tailwind but with stricter conventions and a custom design system layer on top. The hybrid approach actually works really well.',
    votes: 183, userVote: 1,
    comments: [
      { id: 'cmt3', postId: 'p2', authorId: 'u5', authorName: 'QuantumLeap', authorAvatar: MOCK_USERS[3].avatar, content: 'I had the same experience. The key insight for me was that Tailwind works best when you have a strong component library that encapsulates the classes.', createdAt: hoursAgo(3), votes: 22, userVote: 1 },
    ],
    files: [],
    createdAt: hoursAgo(8), reported: false,
  },
  {
    id: 'p3', communityId: 'c2', authorId: 'u4', authorName: 'Anonymous',
    authorAvatar: '', anonymous: true,
    title: 'Controversial take: TypeScript is slowing down innovation in the JS ecosystem',
    content: 'Before you downvote, hear me out. TypeScript has undeniably improved code quality in large codebases. But I think the mandatory-TypeScript culture has started to harm small projects and rapid prototyping.\n\nWhen every new library ships TypeScript-first, the barrier to contribution goes up. Many brilliant JavaScript developers who could contribute can\'t because they\'re not TypeScript experts. We\'re narrowing our contributor base.\n\nThis isn\'t an anti-TypeScript post. It\'s a plea for the community to remember that JavaScript\'s accessibility was always its superpower.',
    votes: 94, userVote: -1,
    comments: [],
    files: [],
    createdAt: hoursAgo(12), reported: false,
  },
  {
    id: 'p4', communityId: 'c1', authorId: 'u1', authorName: 'NebulaUser',
    authorAvatar: CURRENT_USER.avatar, anonymous: false,
    title: 'Show HN: I built a Figma plugin that generates accessible color palettes',
    content: 'After struggling to find tools that both look good AND meet WCAG 2.1 AA/AAA standards, I built a Figma plugin that generates accessible color palettes.\n\nFeatures:\n• Generates 9-shade palettes for any base color\n• Real-time contrast ratio checking (shows WCAG grades)\n• One-click export to CSS custom properties, Tailwind config, or JSON\n• Supports P3 wide-gamut colors for modern displays\n\nIt\'s free and open source. Link in comments!',
    votes: 412, userVote: 1,
    comments: [
      { id: 'cmt4', postId: 'p4', authorId: 'u2', authorName: 'StargazerX', authorAvatar: MOCK_USERS[0].avatar, content: 'This is exactly what I\'ve been looking for! Does it support dark mode palette generation?', createdAt: hoursAgo(1), votes: 5, userVote: 0 },
    ],
    files: [
      { id: 'f2', name: 'plugin-demo.gif', size: 1820000, type: 'image/gif' },
      { id: 'f3', name: 'source-code.zip', size: 458000, type: 'application/zip' },
    ],
    createdAt: hoursAgo(18), reported: false,
  },
  {
    id: 'p5', communityId: 'c3', authorId: 'u5', authorName: 'QuantumLeap',
    authorAvatar: MOCK_USERS[3].avatar, anonymous: false,
    title: 'Deep dive: Understanding React\'s new compiler and what it means for your apps',
    content: 'The React team recently shipped the React Compiler (formerly React Forget). After spending a week integrating it into a production app, here are my findings.\n\nThe TL;DR: It works as advertised but requires your code to follow the Rules of React strictly. Any violations cause the compiler to bail out on that component, which is fine but can be surprising.\n\nPerformance gains are real but not uniform. Components with complex derived state saw 40-60% fewer renders. Simple display components saw minimal change.',
    votes: 328, userVote: 0,
    comments: [],
    files: [{ id: 'f4', name: 'benchmark-results.pdf', size: 890000, type: 'application/pdf' }],
    createdAt: daysAgo(1), reported: false,
  },
];

const INITIAL_COMMUNITIES: Community[] = [
  {
    id: 'c1', name: 'DevCraft', description: 'A space for developers to share projects, code snippets, and technical deep-dives. From web to systems programming, all languages welcome.',
    captainId: 'u2', captainName: 'StargazerX', memberCount: 1247, joined: true, createdAt: daysAgo(120), color: '#6C63FF',
    members: [
      { id: 'u2', username: 'StargazerX', avatar: MOCK_USERS[0].avatar, role: 'captain' },
      { id: 'u1', username: 'NebulaUser', avatar: CURRENT_USER.avatar, role: 'member' },
      { id: 'u3', username: 'CosmicDrift', avatar: MOCK_USERS[1].avatar, role: 'member' },
    ],
  },
  {
    id: 'c2', name: 'HotTakes', description: 'Unpopular opinions, controversial takes, and spicy tech discussions. Keep it civil but don\'t hold back your real thoughts.',
    captainId: 'u4', captainName: 'VoidWalker', memberCount: 892, joined: true, createdAt: daysAgo(60), color: '#EF4444',
    members: [
      { id: 'u4', username: 'VoidWalker', avatar: MOCK_USERS[2].avatar, role: 'captain' },
      { id: 'u1', username: 'NebulaUser', avatar: CURRENT_USER.avatar, role: 'member' },
    ],
  },
  {
    id: 'c3', name: 'ReactLab', description: 'Everything React — hooks, patterns, performance, and the latest ecosystem updates. Beginners and experts both welcome.',
    captainId: 'u5', captainName: 'QuantumLeap', memberCount: 2341, joined: false, createdAt: daysAgo(200), color: '#38BDF8',
    members: [
      { id: 'u5', username: 'QuantumLeap', avatar: MOCK_USERS[3].avatar, role: 'captain' },
      { id: 'u2', username: 'StargazerX', avatar: MOCK_USERS[0].avatar, role: 'member' },
    ],
  },
  {
    id: 'c4', name: 'DesignSystems', description: 'Building, scaling, and maintaining design systems. Token management, component APIs, documentation, and cross-team collaboration.',
    captainId: 'u3', captainName: 'CosmicDrift', memberCount: 567, joined: false, createdAt: daysAgo(45), color: '#22C55E',
    members: [
      { id: 'u3', username: 'CosmicDrift', avatar: MOCK_USERS[1].avatar, role: 'captain' },
    ],
  },
  {
    id: 'c5', name: 'OpenSourceNow', description: 'Celebrating open source software and the communities that build it. Share your projects, find contributors, discuss sustainability.',
    captainId: 'u1', captainName: 'NebulaUser', memberCount: 1089, joined: true, createdAt: daysAgo(150), color: '#F59E0B',
    members: [
      { id: 'u1', username: 'NebulaUser', avatar: CURRENT_USER.avatar, role: 'captain' },
      { id: 'u2', username: 'StargazerX', avatar: MOCK_USERS[0].avatar, role: 'member' },
      { id: 'u4', username: 'VoidWalker', avatar: MOCK_USERS[2].avatar, role: 'member' },
    ],
  },
  {
    id: 'c6', name: 'AIFrontiers', description: 'Exploring the frontiers of artificial intelligence — LLMs, diffusion models, agents, and the ethics of AI development.',
    captainId: 'u5', captainName: 'QuantumLeap', memberCount: 3892, joined: false, createdAt: daysAgo(30), color: '#A78BFA',
    members: [
      { id: 'u5', username: 'QuantumLeap', avatar: MOCK_USERS[3].avatar, role: 'captain' },
    ],
  },
];

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv1', participantId: 'u2', participantName: 'StargazerX',
    participantAvatar: MOCK_USERS[0].avatar, online: true,
    lastMessage: 'Did you see my new post about WebSockets?', lastMessageAt: hoursAgo(0.5),
    messages: [
      { id: 'm1', conversationId: 'conv1', senderId: 'u2', content: 'Hey! Great work on that Figma plugin', createdAt: hoursAgo(3) },
      { id: 'm2', conversationId: 'conv1', senderId: 'u1', content: 'Thanks! I spent way too long on the contrast calculations lol', createdAt: hoursAgo(2.8) },
      { id: 'm3', conversationId: 'conv1', senderId: 'u2', content: 'It shows 😄 Hey, would you be interested in collaborating on a design system toolkit?', createdAt: hoursAgo(2.5) },
      { id: 'm4', conversationId: 'conv1', senderId: 'u1', content: 'Absolutely! I\'ve been thinking about something similar. Want to jump on a call this week?', createdAt: hoursAgo(2) },
      { id: 'm5', conversationId: 'conv1', senderId: 'u2', content: 'Did you see my new post about WebSockets?', createdAt: hoursAgo(0.5) },
    ],
  },
  {
    id: 'conv2', participantId: 'u3', participantName: 'CosmicDrift',
    participantAvatar: MOCK_USERS[1].avatar, online: false,
    lastMessage: 'The CSS file is attached above!', lastMessageAt: hoursAgo(6),
    messages: [
      { id: 'm6', conversationId: 'conv2', senderId: 'u3', content: 'Hi! I saw your Tailwind post. I\'m in the same boat', createdAt: hoursAgo(8) },
      { id: 'm7', conversationId: 'conv2', senderId: 'u1', content: 'Right? It\'s such a love/hate relationship', createdAt: hoursAgo(7) },
      { id: 'm8', conversationId: 'conv2', senderId: 'u3', content: 'Can I see your custom CSS utilities file?', createdAt: hoursAgo(6.5) },
      { id: 'm9', conversationId: 'conv2', senderId: 'u1', content: 'The CSS file is attached above!', createdAt: hoursAgo(6), file: { id: 'mf1', name: 'utilities.css', size: 12400, type: 'text/css' } },
    ],
  },
  {
    id: 'conv3', participantId: 'u4', participantName: 'VoidWalker',
    participantAvatar: MOCK_USERS[2].avatar, online: true,
    lastMessage: 'We need more moderators in HotTakes tbh', lastMessageAt: daysAgo(1),
    messages: [
      { id: 'm10', conversationId: 'conv3', senderId: 'u4', content: 'We need more moderators in HotTakes tbh', createdAt: daysAgo(1) },
    ],
  },
];

const INITIAL_REPORTS: Report[] = [
  { id: 'r1', contentType: 'Post', contentId: 'p3', reason: 'Spreading misinformation about programming languages', reporterId: 'u2', reporterName: 'StargazerX', createdAt: hoursAgo(4), status: 'Pending' },
  { id: 'r2', contentType: 'User', contentId: 'u5', reason: 'Spam — repeatedly posting identical content', reporterId: 'u3', reporterName: 'CosmicDrift', createdAt: hoursAgo(12), status: 'Pending' },
  { id: 'r3', contentType: 'Post', contentId: 'p1', reason: 'Off-topic for the community', reporterId: 'u4', reporterName: 'VoidWalker', createdAt: daysAgo(2), status: 'Resolved' },
  { id: 'r4', contentType: 'User', contentId: 'u3', reason: 'Harassing other users in DMs', reporterId: 'u5', reporterName: 'QuantumLeap', createdAt: daysAgo(3), status: 'Resolved' },
];

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [communities, setCommunities] = useState<Community[]>(INITIAL_COMMUNITIES);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);

  const createPost = useCallback((data: Partial<Post>): Post => {
    const newPost: Post = {
      id: generateId(), authorId: CURRENT_USER.id, authorName: data.anonymous ? 'Anonymous' : CURRENT_USER.username,
      authorAvatar: data.anonymous ? '' : CURRENT_USER.avatar, anonymous: data.anonymous || false,
      title: data.title || '', content: data.content || '', votes: 0, userVote: 0,
      comments: [], files: data.files || [], createdAt: new Date().toISOString(),
      communityId: data.communityId, reported: false,
    };
    setPosts(prev => [newPost, ...prev]);
    return newPost;
  }, []);

  const updatePost = useCallback((id: string, data: Partial<Post>) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  }, []);

  const deletePost = useCallback((id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  }, []);

  const votePost = useCallback((id: string, vote: 1 | -1) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const prevVote = p.userVote;
      const newVote = prevVote === vote ? 0 : vote;
      const diff = newVote - prevVote;
      return { ...p, votes: p.votes + diff, userVote: newVote as 0 | 1 | -1 };
    }));
  }, []);

  const addComment = useCallback((postId: string, content: string): Comment => {
    const comment: Comment = {
      id: generateId(), postId, authorId: CURRENT_USER.id, authorName: CURRENT_USER.username,
      authorAvatar: CURRENT_USER.avatar, content, createdAt: new Date().toISOString(), votes: 0, userVote: 0,
    };
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, comment] } : p));
    return comment;
  }, []);

  const voteComment = useCallback((postId: string, commentId: string, vote: 1 | -1) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        comments: p.comments.map(c => {
          if (c.id !== commentId) return c;
          const prevVote = c.userVote;
          const newVote = prevVote === vote ? 0 : vote;
          return { ...c, votes: c.votes + (newVote - prevVote), userVote: newVote as 0 | 1 | -1 };
        }),
      };
    }));
  }, []);

  const deleteComment = useCallback((postId: string, commentId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments.filter(c => c.id !== commentId) } : p));
  }, []);

  const createCommunity = useCallback((data: Partial<Community>): Community => {
    const newCommunity: Community = {
      id: generateId(), name: data.name || '', description: data.description || '',
      captainId: CURRENT_USER.id, captainName: CURRENT_USER.username, memberCount: 1,
      members: [{ id: CURRENT_USER.id, username: CURRENT_USER.username, avatar: CURRENT_USER.avatar, role: 'captain' }],
      joined: true, createdAt: new Date().toISOString(), color: data.color || '#6C63FF',
    };
    setCommunities(prev => [newCommunity, ...prev]);
    return newCommunity;
  }, []);

  const joinCommunity = useCallback((id: string) => {
    setCommunities(prev => prev.map(c => c.id === id ? {
      ...c, joined: true, memberCount: c.memberCount + 1,
      members: [...c.members, { id: CURRENT_USER.id, username: CURRENT_USER.username, avatar: CURRENT_USER.avatar, role: 'member' as const }],
    } : c));
  }, []);

  const leaveCommunity = useCallback((id: string) => {
    setCommunities(prev => prev.map(c => c.id === id ? {
      ...c, joined: false, memberCount: c.memberCount - 1,
      members: c.members.filter(m => m.id !== CURRENT_USER.id),
    } : c));
  }, []);

  const sendMessage = useCallback((conversationId: string, content: string, file?: FileAttachment) => {
    const msg: Message = {
      id: generateId(), conversationId, senderId: CURRENT_USER.id,
      content, createdAt: new Date().toISOString(), file,
    };
    setConversations(prev => prev.map(conv => conv.id === conversationId ? {
      ...conv, messages: [...conv.messages, msg],
      lastMessage: file ? `📎 ${file.name}` : content, lastMessageAt: msg.createdAt,
    } : conv));
  }, []);

  const resolveReport = useCallback((id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'Resolved' } : r));
  }, []);

  const dismissReport = useCallback((id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
  }, []);

  const reportContent = useCallback((contentType: 'Post' | 'User', contentId: string, reason: string) => {
    const report: Report = {
      id: generateId(), contentType, contentId, reason,
      reporterId: CURRENT_USER.id, reporterName: CURRENT_USER.username,
      createdAt: new Date().toISOString(), status: 'Pending',
    };
    setReports(prev => [report, ...prev]);
  }, []);

  return (
    <AppContext.Provider value={{
      currentUser: CURRENT_USER, posts, communities, conversations, reports,
      isAuthenticated, setIsAuthenticated,
      createPost, updatePost, deletePost, votePost,
      addComment, voteComment, deleteComment,
      createCommunity, joinCommunity, leaveCommunity,
      sendMessage, resolveReport, dismissReport, reportContent,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
