const axios = require('axios');
const crypto = require('crypto');

const SMILE_CONFIG = {
  email: process.env.SMILE_EMAIL || 'smilestockapi@gmail.com',
  uid: process.env.SMILE_UID || '2932248',
  mKey: process.env.SMILE_M_KEY || 'b7919dab2af9089c1502c50bf665e171',
  baseUrl: process.env.SMILE_BASE_URL || 'https://www.smile.one/smilecoin/api/'
};

// Generate MD5 signature for Smile API
function generateSignature(params) {
  try {
    // Sort parameters by key
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    // Create signature: md5(md5(sortedParams + '&m_key'))
    const firstHash = crypto.createHash('md5').update(sortedParams + '&m_key').digest('hex');
    const signature = crypto.createHash('md5').update(firstHash).digest('hex');
    
    return signature;
  } catch (error) {
    console.error('Signature generation error:', error);
    throw error;
  }
}

// Get user role from Smile API
async function getUserRole() {
  try {
    const params = {
      email: SMILE_CONFIG.email,
      uid: SMILE_CONFIG.uid
    };

    const signature = generateSignature(params);
    const requestData = {
      ...params,
      sign: signature
    };

    const response = await axios.post(`${SMILE_CONFIG.baseUrl}getrole`, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'GameTopUp/1.0'
      },
      timeout: 30000
    });

    console.log('Get role response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Get role error:', error);
    throw error;
  }
}

// Create order through Smile API
async function createSmileOrder(orderData) {
  try {
    const params = {
      email: SMILE_CONFIG.email,
      uid: SMILE_CONFIG.uid,
      order_id: orderData.orderId,
      product_id: orderData.packId,
      target: orderData.gameId,
      server_id: orderData.zoneId || '',
      amount: orderData.amount.toString(),
      timestamp: Math.floor(Date.now() / 1000).toString()
    };

    const signature = generateSignature(params);
    const requestData = {
      ...params,
      sign: signature
    };

    console.log('Creating Smile order with params:', requestData);

    const response = await axios.post(`${SMILE_CONFIG.baseUrl}createorder`, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'GameTopUp/1.0'
      },
      timeout: 30000
    });

    console.log('Create order response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Create order error:', error);
    throw error;
  }
}

// Process order through Smile API
async function processSmileOrder(orderData) {
  try {
    console.log('Processing Smile order:', orderData);

    // First, verify user role
    const roleCheck = await getUserRole();
    if (!roleCheck || roleCheck.error) {
      return {
        success: false,
        error: 'Failed to verify Smile API access'
      };
    }

    // Create order
    const orderResult = await createSmileOrder(orderData);
    
    if (orderResult && orderResult.status === 'success') {
      return {
        success: true,
        orderId: orderResult.order_id || orderData.orderId,
        message: orderResult.message || 'Order processed successfully',
        data: orderResult
      };
    } else {
      return {
        success: false,
        error: orderResult.message || 'Order processing failed',
        data: orderResult
      };
    }
  } catch (error) {
    console.error('Process Smile order error:', error);
    return {
      success: false,
      error: error.message || 'API request failed'
    };
  }
}

// Check order status
async function checkOrderStatus(orderId) {
  try {
    const params = {
      email: SMILE_CONFIG.email,
      uid: SMILE_CONFIG.uid,
      order_id: orderId
    };

    const signature = generateSignature(params);
    const requestData = {
      ...params,
      sign: signature
    };

    const response = await axios.post(`${SMILE_CONFIG.baseUrl}checkorder`, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'GameTopUp/1.0'
      },
      timeout: 30000
    });

    console.log('Check order status response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Check order status error:', error);
    throw error;
  }
}

// Get balance from Smile API
async function getBalance() {
  try {
    const params = {
      email: SMILE_CONFIG.email,
      uid: SMILE_CONFIG.uid
    };

    const signature = generateSignature(params);
    const requestData = {
      ...params,
      sign: signature
    };

    const response = await axios.post(`${SMILE_CONFIG.baseUrl}getbalance`, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'GameTopUp/1.0'
      },
      timeout: 30000
    });

    console.log('Get balance response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Get balance error:', error);
    throw error;
  }
}

// Test Smile API connection
async function testSmileAPI() {
  try {
    const roleResult = await getUserRole();
    const balanceResult = await getBalance();
    
    return {
      success: true,
      roleCheck: roleResult,
      balance: balanceResult,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Smile API test error:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = {
  processSmileOrder,
  checkOrderStatus,
  getUserRole,
  getBalance,
  testSmileAPI,
  generateSignature
};