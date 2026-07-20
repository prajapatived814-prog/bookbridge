/**
 * ==========================================================================
 * OFFICIAL RCTI DATABASE ENGINE (MY UPLOADS & REAL-TIME SYNC)
 * ==========================================================================
 */

const STORAGE_KEY_BOOKS = 'rcti_gtu_lab_manual_books';
const STORAGE_KEY_USERS = 'rcti_gtu_users';
const STORAGE_KEY_CURRENT_USER = 'rcti_gtu_current_user';
const STORAGE_KEY_OFFERS = 'rcti_gtu_offers';
const STORAGE_KEY_TRANSACTIONS = 'rcti_gtu_txs';
const STORAGE_KEY_WISHLIST = 'rcti_gtu_wishlist';
const STORAGE_KEY_MESSAGES = 'rcti_gtu_messages';
const STORAGE_KEY_REVIEWS = 'rcti_gtu_reviews';
const STORAGE_KEY_POSTS = 'rcti_gtu_community_posts';

const SEED_USERS = [
  {
    id: 'usr-admin',
    name: 'Prof. T. B. Mehta (Admin & Guide)',
    enrollment: 'FAC-CE-001',
    email: 'admin@rcti.ac.in',
    branch: 'CE',
    semester: 5,
    division: 'Div A',
    academicYear: '2025-2026',
    whatsapp: '+919876543210',
    role: 'admin',
    createdAt: '2026-07-20T00:00:00Z'
  },
  {
    id: 'usr-ved',
    name: 'Ved V. Patel (Group 05 Lead)',
    enrollment: '246400307192',
    email: 'ved.ce@rcti.ac.in',
    branch: 'CE',
    semester: 5,
    division: 'Div A',
    academicYear: '2025-2026',
    whatsapp: '+919876543210',
    role: 'student',
    createdAt: '2026-07-20T08:00:00Z'
  }
];

const SEED_BOOKS = [
  {
    id: 'rcti-lab-1',
    category: 'digital',
    title: 'GTU DATA STRUCTURES (DS: 3330704) PRACTICAL LAB MANUAL',
    author: 'RCTI COMPUTER ENGG DEPT',
    isbn: 'GTU-3330704-LAB',
    gtuCode: '3330704',
    resourceType: 'lab_manual',
    genre: 'Computer Engineering',
    subject: 'Data Structures',
    semester: 3,
    branch: 'CE',
    edition: 'RCTI 2025 Lab Edition',
    publisher: 'RCTI Dept Portal',
    condition: 'Like New',
    language: 'English',
    mode: 'donate',
    price: 0,
    exchangeFor: '',
    description: 'Official GTU Practical Lab Manual from RCTI Computer Dept portal. Contains 20+ completed C practical programs on Stacks, Queues, Linked Lists, Trees, and Sorting.',
    pdfUrl: 'https://webrcticomp.wixsite.com/rcticomputer',
    contactPreference: 'Both',
    seller: { id: 'usr-admin', name: 'RCTI Comp Dept Lab Admin', rating: 5.0, email: 'admin@rcti.ac.in', whatsapp: '+919876543210', role: 'admin' },
    location: 'RCTI Computer Lab 1 & 2',
    coverGradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    textColor: '#ffffff',
    icon: '📋',
    status: 'Available',
    viewsCount: 42,
    wishlistCount: 15,
    createdAt: '2026-07-20T10:00:00Z'
  },
  {
    id: 'rcti-1',
    category: 'physical',
    title: 'DATA STRUCTURES IN C (GTU CODE: 3330704)',
    author: 'ATUL PRAKASHAN / MAHAJAN',
    isbn: 'GTU-3330704',
    gtuCode: '3330704',
    resourceType: 'textbook',
    genre: 'Computer Engineering',
    subject: 'Data Structures',
    semester: 3,
    branch: 'CE',
    edition: 'Atul 2025 Ed',
    publisher: 'Atul Prakashan',
    condition: 'Like New',
    language: 'English',
    mode: 'exchange',
    price: 0,
    exchangeFor: 'Swap for DBMS (3340701) or Operating Systems',
    description: 'GTU 3rd Semester Computer Engineering & IT diploma textbook. Covers Pointers, Stacks, Queues, Linked Lists, Trees, and Graphs.',
    contactPreference: 'Both',
    seller: { id: 'usr-ved', name: 'Ved V. Patel (Group 05 Lead)', rating: 5.0, email: 'ved.ce@rcti.ac.in', whatsapp: '+919876543210', role: 'student' },
    location: 'RCTI CE Block, Room 204',
    coverGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    textColor: '#ffffff',
    icon: '📖',
    status: 'Available',
    viewsCount: 28,
    wishlistCount: 8,
    createdAt: '2026-07-20T10:00:00Z'
  }
];

class OfficialRCTIDatabase {
  constructor() { this.isInitialized = false; }

  async init() {
    if (this.isInitialized) return;
    if (!localStorage.getItem(STORAGE_KEY_USERS)) {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(SEED_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEY_BOOKS)) {
      localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(SEED_BOOKS));
    }
    if (!localStorage.getItem(STORAGE_KEY_OFFERS)) {
      localStorage.setItem(STORAGE_KEY_OFFERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEY_TRANSACTIONS)) {
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEY_WISHLIST)) {
      localStorage.setItem(STORAGE_KEY_WISHLIST, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEY_MESSAGES)) {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEY_REVIEWS)) {
      localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEY_POSTS)) {
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify([]));
    }
    this.isInitialized = true;
  }

  async registerUser(userData) {
    await this.init();
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    if (users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('Account already registered for this email.');
    }
    const role = userData.role || (userData.email.toLowerCase().includes('admin') ? 'admin' : 'student');
    const newUser = {
      id: 'usr-' + Date.now(),
      name: userData.name,
      enrollment: userData.enrollment || ('246400307' + Math.floor(100 + Math.random() * 900)),
      email: userData.email,
      branch: userData.branch || 'CE',
      semester: parseInt(userData.semester || 5),
      division: userData.division || 'Div A',
      academicYear: userData.academicYear || '2025-2026',
      whatsapp: userData.whatsapp || '',
      college: 'R. C. Technical Institute, Ahmedabad (GTU)',
      role: role,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(newUser));
    return newUser;
  }

  async loginUser(email, password) {
    await this.init();
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      const role = email.toLowerCase().includes('admin') ? 'admin' : (email.toLowerCase().includes('faculty') ? 'faculty' : 'student');
      user = await this.registerUser({
        name: email.split('@')[0].toUpperCase(),
        enrollment: '246400307210',
        email: email,
        branch: 'CE',
        semester: 5,
        division: 'Div A',
        academicYear: '2025-2026',
        whatsapp: '+919876543210',
        role: role
      });
    } else {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    }
    return user;
  }

  async getCurrentUser() {
    await this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEY_CURRENT_USER) || 'null');
  }

  async logoutUser() {
    await this.init();
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
  }

  async getAllUsers() {
    await this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
  }

  async deleteUser(userId) {
    await this.init();
    let users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    users = users.filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }

  async getAdminStats() {
    await this.init();
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    const books = JSON.parse(localStorage.getItem(STORAGE_KEY_BOOKS) || '[]');
    const transactions = JSON.parse(localStorage.getItem(STORAGE_KEY_TRANSACTIONS) || '[]');
    const offers = JSON.parse(localStorage.getItem(STORAGE_KEY_OFFERS) || '[]');

    return {
      totalUsers: users.length,
      totalListings: books.length,
      totalTransactions: transactions.length,
      totalOffers: offers.length,
      activeSwaps: books.filter(b => b.mode === 'exchange').length,
      freeDonations: books.filter(b => b.mode === 'donate').length
    };
  }

  /* WISHLIST */
  async toggleWishlist(bookId) {
    await this.init();
    let list = JSON.parse(localStorage.getItem(STORAGE_KEY_WISHLIST) || '[]');
    const index = list.indexOf(bookId);
    let added = false;
    if (index >= 0) {
      list.splice(index, 1);
    } else {
      list.push(bookId);
      added = true;
    }
    localStorage.setItem(STORAGE_KEY_WISHLIST, JSON.stringify(list));
    return added;
  }

  async getWishlistIds() {
    await this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEY_WISHLIST) || '[]');
  }

  async getWishlistBooks() {
    await this.init();
    const ids = await this.getWishlistIds();
    const books = JSON.parse(localStorage.getItem(STORAGE_KEY_BOOKS) || '[]');
    return books.filter(b => ids.includes(b.id));
  }

  /* MESSAGES */
  async getMessages(otherUserEmail) {
    await this.init();
    const currentUser = await this.getCurrentUser();
    const allMsgs = JSON.parse(localStorage.getItem(STORAGE_KEY_MESSAGES) || '[]');
    if (!currentUser) return [];

    return allMsgs.filter(m => 
      (m.senderEmail === currentUser.email && m.receiverEmail === otherUserEmail) ||
      (m.receiverEmail === currentUser.email && m.senderEmail === otherUserEmail)
    );
  }

  async sendMessage(receiverEmail, text, bookTitle = '') {
    await this.init();
    const currentUser = await this.getCurrentUser();
    if (!currentUser) throw new Error('Must be logged in to send messages');

    const allMsgs = JSON.parse(localStorage.getItem(STORAGE_KEY_MESSAGES) || '[]');
    const newMsg = {
      id: 'msg-' + Date.now(),
      senderName: currentUser.name,
      senderEmail: currentUser.email,
      receiverEmail: receiverEmail,
      text: text,
      bookTitle: bookTitle,
      timestamp: new Date().toISOString()
    };

    allMsgs.push(newMsg);
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(allMsgs));
    return newMsg;
  }

  /* REVIEWS */
  async addReview(sellerEmail, rating, comment) {
    await this.init();
    const currentUser = await this.getCurrentUser();
    const reviews = JSON.parse(localStorage.getItem(STORAGE_KEY_REVIEWS) || '[]');

    const newReview = {
      id: 'rev-' + Date.now(),
      sellerEmail: sellerEmail,
      reviewerName: currentUser?.name || 'Anonymous Student',
      rating: parseInt(rating),
      comment: comment,
      date: new Date().toISOString()
    };

    reviews.unshift(newReview);
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
    return newReview;
  }

  async getSellerReviews(sellerEmail) {
    await this.init();
    const reviews = JSON.parse(localStorage.getItem(STORAGE_KEY_REVIEWS) || '[]');
    return reviews.filter(r => r.sellerEmail === sellerEmail);
  }

  /* AI RECOMMENDATIONS */
  async getAIRecommendations(branch = 'CE', semester = 5) {
    await this.init();
    const books = JSON.parse(localStorage.getItem(STORAGE_KEY_BOOKS) || '[]');
    return books.map(b => {
      let score = 0;
      if (b.branch === branch || b.branch === 'All') score += 40;
      if (b.semester === parseInt(semester)) score += 50;
      if (b.resourceType === 'lab_manual') score += 10;
      return { ...b, aiScore: score };
    }).sort((a, b) => b.aiScore - a.aiScore).slice(0, 4);
  }

  /* BOOKS CRUD */
  async getBooks(filters = {}) {
    await this.init();
    let books = JSON.parse(localStorage.getItem(STORAGE_KEY_BOOKS) || '[]');
    const { query, mode, genre, semester, branch, resourceType, condition, sort, category } = filters;

    if (query && query.trim() !== '') {
      const q = query.toLowerCase().trim();
      books = books.filter(b => 
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.genre.toLowerCase().includes(q) ||
        (b.subject && b.subject.toLowerCase().includes(q)) ||
        (b.gtuCode && b.gtuCode.toLowerCase().includes(q)) ||
        (b.isbn && b.isbn.toLowerCase().includes(q))
      );
    }

    if (category && category !== 'all') books = books.filter(b => (b.category || 'physical') === category);
    if (mode && mode !== 'all') books = books.filter(b => b.mode === mode);
    if (genre && genre !== 'all') books = books.filter(b => b.genre.toLowerCase() === genre.toLowerCase() || b.branch === genre);
    if (semester && semester !== 'all') books = books.filter(b => b.semester.toString() === semester.toString());
    if (branch && branch !== 'all') books = books.filter(b => b.branch === 'All' || b.branch === branch);
    if (resourceType && resourceType !== 'all') books = books.filter(b => b.resourceType === resourceType);
    if (condition && condition !== 'all') books = books.filter(b => b.condition === condition);

    if (sort === 'price-low') books.sort((a, b) => a.price - b.price);
    if (sort === 'price-high') books.sort((a, b) => b.price - a.price);
    if (sort === 'semester') books.sort((a, b) => a.semester - b.semester);

    return books;
  }

  async getBookById(id) {
    await this.init();
    const books = JSON.parse(localStorage.getItem(STORAGE_KEY_BOOKS) || '[]');
    return books.find(b => b.id === id) || null;
  }

  async addBook(bookData) {
    await this.init();
    const books = JSON.parse(localStorage.getItem(STORAGE_KEY_BOOKS) || '[]');
    const currentUser = await this.getCurrentUser();

    const resType = bookData.resourceType || 'textbook';
    let icon = '📖';
    if (resType === 'lab_manual') icon = '📋';
    if (resType === 'question_bank') icon = '📑';
    if (resType === 'project_report') icon = '📂';

    const gradients = [
      'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
      'linear-gradient(135deg, #059669 0%, #047857 100%)',
      'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
      'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
    ];

    const newBook = {
      id: 'rcti-' + Date.now(),
      category: bookData.category || 'physical',
      title: bookData.title.toUpperCase(),
      author: bookData.author.toUpperCase(),
      isbn: bookData.isbn || 'GTU-N/A',
      gtuCode: bookData.gtuCode || '',
      resourceType: resType,
      genre: bookData.genre || 'Computer Engineering',
      subject: bookData.subject || bookData.title,
      semester: parseInt(bookData.semester || 5),
      branch: bookData.branch || 'CE',
      edition: bookData.edition || 'GTU Edition',
      publisher: bookData.publisher || 'Atul Prakashan',
      language: bookData.language || 'English',
      mode: bookData.mode || 'exchange',
      price: bookData.mode === 'sell' ? (parseFloat(bookData.price) || 0) : 0,
      exchangeFor: bookData.mode === 'exchange' ? bookData.exchangeFor : '',
      condition: bookData.condition || 'Good',
      description: bookData.description || 'GTU diploma resource listed on BookBridge.',
      pdfUrl: bookData.pdfUrl || '',
      contactPreference: bookData.contactPreference || 'Both',
      seller: {
        id: currentUser?.id || 'usr-guest',
        name: currentUser?.name || bookData.sellerName || 'RCTI Student',
        role: currentUser?.role || 'student',
        rating: 5.0,
        email: currentUser?.email || bookData.sellerEmail || 'student@rcti.ac.in',
        whatsapp: bookData.sellerWhatsapp || currentUser?.whatsapp || '+919876543210'
      },
      location: bookData.location || 'RCTI Campus, Ahmedabad',
      coverGradient: gradients[Math.floor(Math.random() * gradients.length)],
      textColor: '#ffffff',
      icon: icon,
      status: 'Available',
      viewsCount: 1,
      wishlistCount: 0,
      createdAt: new Date().toISOString()
    };

    books.unshift(newBook);
    localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));
    return newBook;
  }

  async updateBook(bookId, updatedFields) {
    await this.init();
    const books = JSON.parse(localStorage.getItem(STORAGE_KEY_BOOKS) || '[]');
    const index = books.findIndex(b => b.id === bookId);
    if (index >= 0) {
      books[index] = { ...books[index], ...updatedFields };
      localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));
      return books[index];
    }
    return null;
  }

  async updateBookStatus(bookId, newStatus) {
    await this.init();
    return await this.updateBook(bookId, { status: newStatus });
  }

  async deleteBook(bookId) {
    await this.init();
    let books = JSON.parse(localStorage.getItem(STORAGE_KEY_BOOKS) || '[]');
    books = books.filter(b => b.id !== bookId);
    localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));
  }

  async buyBook(bookId, buyerInfo) {
    await this.init();
    await this.updateBookStatus(bookId, 'Sold');
  }

  async proposeExchange(offerData) {
    await this.init();
    const offers = JSON.parse(localStorage.getItem(STORAGE_KEY_OFFERS) || '[]');
    offers.unshift(offerData);
    localStorage.setItem(STORAGE_KEY_OFFERS, JSON.stringify(offers));
  }

  async claimDonation(bookId, claimantInfo) {
    await this.init();
    await this.updateBookStatus(bookId, 'Sold');
  }
}

window.BookDB = new OfficialRCTIDatabase();
