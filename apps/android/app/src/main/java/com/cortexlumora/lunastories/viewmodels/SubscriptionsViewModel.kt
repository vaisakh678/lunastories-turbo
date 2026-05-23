package com.cortexlumora.lunastories.viewmodels

import android.app.Activity
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.cortexlumora.lunastories.subscriptions.Subscriptions
import com.revenuecat.purchases.CustomerInfo
import com.revenuecat.purchases.Offerings
import com.revenuecat.purchases.Package
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class SubscriptionsViewModel : ViewModel() {
    private val _offerings = MutableStateFlow<Offerings?>(null)
    val offerings: StateFlow<Offerings?> = _offerings.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _isPurchasing = MutableStateFlow(false)
    val isPurchasing: StateFlow<Boolean> = _isPurchasing.asStateFlow()

    private val _isRestoring = MutableStateFlow(false)
    val isRestoring: StateFlow<Boolean> = _isRestoring.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _didSucceed = MutableStateFlow(false)
    val didSucceed: StateFlow<Boolean> = _didSucceed.asStateFlow()

    private val _customerInfo = MutableStateFlow<CustomerInfo?>(null)
    val customerInfo: StateFlow<CustomerInfo?> = _customerInfo.asStateFlow()

    val isPro: Boolean get() = Subscriptions.isEntitled(_customerInfo.value)

    init { refresh() }

    fun refresh() {
        viewModelScope.launch {
            _isLoading.value = true
            _offerings.value = Subscriptions.offerings()
            _customerInfo.value = Subscriptions.customerInfo()
            _isLoading.value = false
        }
    }

    fun purchase(activity: Activity, pkg: Package) {
        if (_isPurchasing.value) return
        _error.value = null
        _isPurchasing.value = true
        viewModelScope.launch {
            runCatching { Subscriptions.purchase(activity, pkg) }
                .onSuccess { (_, info) ->
                    _customerInfo.value = info
                    if (Subscriptions.isEntitled(info)) _didSucceed.value = true
                }
                .onFailure { _error.value = it.message ?: "Couldn't complete the purchase" }
            _isPurchasing.value = false
        }
    }

    fun restore() {
        if (_isRestoring.value) return
        _error.value = null
        _isRestoring.value = true
        viewModelScope.launch {
            runCatching { Subscriptions.restore() }
                .onSuccess { info ->
                    _customerInfo.value = info
                    if (Subscriptions.isEntitled(info)) {
                        _didSucceed.value = true
                    } else {
                        _error.value = "No active Pro subscription found on this Google account."
                    }
                }
                .onFailure { _error.value = it.message ?: "Couldn't restore purchases" }
            _isRestoring.value = false
        }
    }

    fun clearError() { _error.value = null }
    fun consumeSuccess() { _didSucceed.value = false }
}
