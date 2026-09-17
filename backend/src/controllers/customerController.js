const customerService = require("../services/customerService");

const getCustomers = async (req, res, next) => {
  try {
    const customers = await customerService.getAllCustomers();
    res.json(customers);
  } catch (err) {
    next(err);
  }
};

const getCustomer = async (req, res, next) => {
  try {
    const numericId = parseInt(req.params.id, 10);
    if (!numericId || isNaN(numericId)) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz müşteri ID'si.",
      });
    }

    const customer = await customerService.getCustomerById(numericId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Müşteri bulunamadı.",
      });
    }
    res.json(customer);
  } catch (err) {
    next(err);
  }
};

const createNewCustomer = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Müşteri adı zorunludur.",
      });
    }

    const newCustomer = await customerService.createCustomer(req.body);
    res.status(201).json(newCustomer);
  } catch (err) {
    next(err);
  }
};

const updateExistingCustomer = async (req, res, next) => {
  try {
    const numericId = parseInt(req.params.id, 10);
    if (!numericId || isNaN(numericId)) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz müşteri ID'si.",
      });
    }

    const updated = await customerService.updateCustomer(numericId, req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Müşteri bulunamadı.",
      });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

const removeCustomer = async (req, res, next) => {
  try {
    const numericId = parseInt(req.params.id, 10);
    if (!numericId || isNaN(numericId)) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz müşteri ID'si.",
      });
    }

    const deleted = await customerService.deleteCustomer(numericId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Müşteri bulunamadı.",
      });
    }
    res.json({
      success: true,
      message: "Müşteri başarıyla silindi.",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCustomers,
  getCustomer,
  createNewCustomer,
  updateExistingCustomer,
  removeCustomer,
};
