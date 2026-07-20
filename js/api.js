/**
 * ==========================================================================
 * BOOKBRIDGE PRODUCTION API LAYER (Full-Stack REST Endpoints)
 * ==========================================================================
 */

const API_BASE_URL = 'http://localhost:3000/api';

class BookBridgeFullStackAPI {
  constructor() { this.useServer = false; }

  async checkServer() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET', signal: AbortSignal.timeout(800) });
      if (res.ok) {
        this.useServer = true;
        console.log('BookBridge API: Production REST Server Active');
      }
    } catch (e) {
      this.useServer = false;
      console.log('BookBridge API: Embedded Engine Mode');
    }
  }

  async register(userData) {
    if (this.useServer) {
      try {
        const res = await fetch(`${API_BASE_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    return await window.BookDB.registerUser(userData);
  }

  async login(email, password) {
    if (this.useServer) {
      try {
        const res = await fetch(`${API_BASE_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    return await window.BookDB.loginUser(email, password);
  }

  async getCurrentUser() { return await window.BookDB.getCurrentUser(); }
  async logout() { await window.BookDB.logoutUser(); }

  /* Admin Endpoints */
  async getAdminStats() { return await window.BookDB.getAdminStats(); }
  async getAllUsers() { return await window.BookDB.getAllUsers(); }
  async deleteUser(userId) { return await window.BookDB.deleteUser(userId); }

  /* Messaging Endpoints */
  async getMessages(otherUserEmail) { return await window.BookDB.getMessages(otherUserEmail); }
  async sendMessage(receiverEmail, text, bookTitle = '') { return await window.BookDB.sendMessage(receiverEmail, text, bookTitle); }

  /* Reviews & Ratings */
  async addReview(sellerEmail, rating, comment) { return await window.BookDB.addReview(sellerEmail, rating, comment); }
  async getSellerReviews(sellerEmail) { return await window.BookDB.getSellerReviews(sellerEmail); }

  /* Books CRUD */
  async getBooks(filters = {}) {
    if (this.useServer) {
      try {
        const params = new URLSearchParams(filters).toString();
        const res = await fetch(`${API_BASE_URL}/books?${params}`);
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    return await window.BookDB.getBooks(filters);
  }

  async getBookById(id) {
    if (this.useServer) {
      try {
        const res = await fetch(`${API_BASE_URL}/books/${id}`);
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    return await window.BookDB.getBookById(id);
  }

  async addBook(bookData) {
    if (this.useServer) {
      try {
        const res = await fetch(`${API_BASE_URL}/books`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookData)
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    return await window.BookDB.addBook(bookData);
  }

  async deleteBook(bookId) {
    if (this.useServer) {
      try {
        await fetch(`${API_BASE_URL}/books/${bookId}`, { method: 'DELETE' });
      } catch (e) {}
    }
    return await window.BookDB.deleteBook(bookId);
  }

  async buyBook(bookId, buyerInfo) { return await window.BookDB.buyBook(bookId, buyerInfo); }
  async proposeExchange(offerData) { return await window.BookDB.proposeExchange(offerData); }
  async claimDonation(bookId, claimantInfo) { return await window.BookDB.claimDonation(bookId, claimantInfo); }
}

window.BookAPI = new BookBridgeFullStackAPI();
window.BookAPI.checkServer();
