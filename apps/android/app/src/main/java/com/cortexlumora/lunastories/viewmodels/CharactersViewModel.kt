package com.cortexlumora.lunastories.viewmodels

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.cortexlumora.lunastories.network.CharacterAPI
import com.cortexlumora.lunastories.network.CharacterResponse
import com.cortexlumora.lunastories.network.CharacterRole
import com.cortexlumora.lunastories.network.CreateCharacterRequest
import com.cortexlumora.lunastories.network.UpdateCharacterRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.serialization.builtins.ListSerializer

private const val CACHE_KEY = "cached_characters_v1"

/**
 * Stale-while-revalidate cache for the character list. Hydrates from
 * SharedPreferences on init so the Home grid renders immediately on
 * cold launch, then refreshes from the API in the background.
 */
class CharactersViewModel(app: Application) : AndroidViewModel(app) {
    private val _characters = MutableStateFlow<List<CharacterResponse>>(emptyList())
    val characters: StateFlow<List<CharacterResponse>> = _characters.asStateFlow()

    private val _isFetching = MutableStateFlow(false)
    val isFetching: StateFlow<Boolean> = _isFetching.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val prefs = app.getSharedPreferences("luna_cache", android.content.Context.MODE_PRIVATE)
    private val serializer = ListSerializer(CharacterResponse.serializer())

    init {
        loadFromDisk()
    }

    val mainCharacters: List<CharacterResponse>
        get() = _characters.value.filter { it.role == CharacterRole.main }

    val sideCharacters: List<CharacterResponse>
        get() = _characters.value.filter { it.role == CharacterRole.side }

    val isLoading: Boolean
        get() = _isFetching.value && _characters.value.isEmpty()

    fun load() {
        viewModelScope.launch {
            _isFetching.value = true
            _error.value = null
            runCatching { CharacterAPI.list() }
                .onSuccess { list ->
                    _characters.value = list
                    saveToDisk(list)
                }
                .onFailure { _error.value = it.message }
            _isFetching.value = false
        }
    }

    fun create(input: CreateCharacterRequest, onDone: (Result<CharacterResponse>) -> Unit = {}) {
        viewModelScope.launch {
            runCatching { CharacterAPI.create(input) }
                .onSuccess { created ->
                    _characters.update { it + created }
                    saveToDisk(_characters.value)
                    onDone(Result.success(created))
                }
                .onFailure {
                    _error.value = it.message
                    onDone(Result.failure(it))
                }
        }
    }

    fun update(
        id: String,
        patch: UpdateCharacterRequest,
        onDone: (Result<CharacterResponse>) -> Unit = {},
    ) {
        viewModelScope.launch {
            runCatching { CharacterAPI.update(id, patch) }
                .onSuccess { updated ->
                    _characters.update { list -> list.map { if (it.id == id) updated else it } }
                    saveToDisk(_characters.value)
                    onDone(Result.success(updated))
                }
                .onFailure {
                    _error.value = it.message
                    onDone(Result.failure(it))
                }
        }
    }

    fun delete(id: String, onDone: (Result<Unit>) -> Unit = {}) {
        viewModelScope.launch {
            runCatching { CharacterAPI.delete(id) }
                .onSuccess {
                    _characters.update { list -> list.filterNot { it.id == id } }
                    saveToDisk(_characters.value)
                    onDone(Result.success(Unit))
                }
                .onFailure {
                    _error.value = it.message
                    onDone(Result.failure(it))
                }
        }
    }

    fun clearError() {
        _error.value = null
    }

    private fun loadFromDisk() {
        val raw = prefs.getString(CACHE_KEY, null) ?: return
        runCatching {
            val parsed = com.cortexlumora.lunastories.network.APIClient.json
                .decodeFromString(serializer, raw)
            _characters.value = parsed
        }
    }

    private fun saveToDisk(list: List<CharacterResponse>) {
        runCatching {
            val raw = com.cortexlumora.lunastories.network.APIClient.json
                .encodeToString(serializer, list)
            prefs.edit().putString(CACHE_KEY, raw).apply()
        }
    }
}
