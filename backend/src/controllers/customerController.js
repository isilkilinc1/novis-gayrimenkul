const customerService = require("../services/customerService");

const getCustomers = async (req, res) => {
  try {
    const customers = await customerService.getAllCustomers();
    res.json(customers);
  } catch (err) {
    console.error("Müşterileri getirme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

const getCustomer = async (req, res) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Müşteri bulunamadı" });
    }
    res.json(customer);
  } catch (err) {
    console.error("Müşteri getirme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

const createNewCustomer = async (req, res) => {
  try {
    const newCustomer = await customerService.createCustomer(req.body);
    res.status(201).json(newCustomer);
  } catch (err) {
    console.error("Müşteri oluşturma hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

const updateExistingCustomer = async (req, res) => {
  try {
    const updated = await customerService.updateCustomer(
      req.params.id,
      req.body,
    );
    if (!updated) {
      return res.status(404).json({ message: "Müşteri bulunamadı" });
    }
    res.json(updated);
  } catch (err) {
    console.error("Müşteri güncelleme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

const removeCustomer = async (req, res) => {
  try {
    const deleted = await customerService.deleteCustomer(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Müşteri bulunamadı" });
    }
    res.json({ message: "Müşteri başarıyla silindi" });
  } catch (err) {
    console.error("Müşteri silme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

module.exports = {
  getCustomers,
  getCustomer,
  createNewCustomer,
  updateExistingCustomer,
  removeCustomer,
};
