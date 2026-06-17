const isSandbox = process.env.ASAAS_SANDBOX !== 'false';
export const ASAAS_API_URL = isSandbox
  ? 'https://sandbox.asaas.com/api/v3'
  : 'https://www.asaas.com/api/v3';
export const ASAAS_API_KEY = process.env.ASAAS_API_KEY || '';

export interface AsaasCustomer {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  cpfCnpj?: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  city?: string;
  state?: string;
}

export interface AsaasPayment {
  customerId: string;
  billingType: 'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'DEBIT_CARD';
  dueDate: string; // YYYY-MM-DD
  value: number;
  description: string;
  externalReference?: string;
  notificationEnabled?: boolean;
  remoteIp?: string;
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
}

/**
 * Criar ou obter cliente no Asaas
 */
export async function createOrGetAsaasCustomer(customer: AsaasCustomer): Promise<string> {
  try {
    const response = await fetch(`${ASAAS_API_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY,
      },
      body: JSON.stringify(customer),
    });

    if (response.ok) {
      const data = await response.json();
      return data.id;
    } else if (response.status === 400) {
      // Cliente já existe, buscar por email
      const listResponse = await fetch(`${ASAAS_API_URL}/customers?email=${encodeURIComponent(customer.email)}`, {
        headers: {
          'access_token': ASAAS_API_KEY,
        },
      });

      if (listResponse.ok) {
        const listData = await listResponse.json();
        if (listData.data && listData.data.length > 0) {
          return listData.data[0].id;
        }
      }
      throw new Error('Erro ao criar/obter cliente Asaas');
    } else {
      throw new Error('Erro ao criar cliente Asaas');
    }
  } catch (error) {
    console.error('Erro ao criar/obter cliente Asaas:', error);
    throw error;
  }
}

/**
 * Criar pagamento (cobrança) no Asaas
 */
export async function createAsaasPayment(payment: AsaasPayment) {
  try {
    const response = await fetch(`${ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY,
      },
      body: JSON.stringify(payment),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.detail || 'Erro ao criar pagamento');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao criar pagamento Asaas:', error);
    throw error;
  }
}

/**
 * Obter detalhes do pagamento
 */
export async function getAsaasPayment(paymentId: string) {
  try {
    const response = await fetch(`${ASAAS_API_URL}/payments/${paymentId}`, {
      headers: {
        'access_token': ASAAS_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao obter pagamento');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao obter pagamento Asaas:', error);
    throw error;
  }
}

/**
 * Obter QR Code PIX do pagamento
 */
export async function getPixQrCode(paymentId: string) {
  try {
    const response = await fetch(`${ASAAS_API_URL}/payments/${paymentId}/pix/qrcode`, {
      headers: {
        'access_token': ASAAS_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao obter QR Code PIX');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao obter QR Code PIX:', error);
    throw error;
  }
}
