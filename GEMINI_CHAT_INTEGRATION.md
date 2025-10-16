# 🤖 Integración de Google Gemini con NutriCoach

## Descripción General

Se ha integrado **Google Gemini** como motor de IA conversacional para NutriCoach, permitiendo interacciones dinámicas y personalizadas con los usuarios. El sistema combina la inteligencia artificial de Gemini con el contexto nutricional y emocional del usuario para ofrecer coaching nutricional inteligente.

## 🚀 Características Principales

### **🧠 IA Conversacional Inteligente**
- **Chat dinámico** con respuestas contextuales
- **Análisis de sentimiento** automático de mensajes
- **Sugerencias de seguimiento** personalizadas
- **Memoria de conversación** por sesiones

### **📊 Contexto Nutricional Integrado**
- **Datos nutricionales** del día actual
- **Perfil del usuario** (objetivos, metas, características)
- **Estado emocional** actual (estrés, energía, ánimo)
- **Historial de conversaciones** recientes

### **🎯 Personalización Avanzada**
- **Prompts especializados** para NutriCoach Luis
- **Análisis contextual** de cada mensaje
- **Respuestas adaptativas** según el estado del usuario
- **Seguimiento de patrones** de conversación

## 🔧 Configuración

### **1. Variables de Entorno**

Agregar en tu archivo `.env`:

```env
# Google Gemini API
GEMINI_API_KEY=tu_api_key_de_gemini_aqui
GEMINI_MODEL=gemini-pro
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=1024
```

### **2. Obtener API Key de Gemini**

1. Visita: https://makersuite.google.com/app/apikey
2. Crea una cuenta de Google
3. Genera una nueva API Key
4. Copia la key y agrégala a tu `.env`

### **3. Ejecutar Migraciones**

```bash
php artisan migrate
```

## 📡 API Endpoints

### **Chat Principal**

#### **Enviar Mensaje**
```http
POST /api/chat/send
Authorization: Bearer {token}
Content-Type: application/json

{
    "message": "Hola, ¿cómo estoy con mis calorías hoy?",
    "session_id": "chat_1737031234_abc123",
    "message_type": "nutrition"
}
```

**Respuesta:**
```json
{
    "success": true,
    "message": "Mensaje procesado exitosamente",
    "data": {
        "conversation_id": 1,
        "session_id": "chat_1737031234_abc123",
        "ai_response": "¡Hola! Veo que hoy has consumido 1,850 calorías de tu objetivo de 2,000. Estás muy cerca de tu meta. ¿Te gustaría que revisemos tus macronutrientes?",
        "sentiment": "positive",
        "sentiment_confidence": 0.85,
        "follow_up_suggestions": [
            "¿Quieres ver un desglose de tus macronutrientes?",
            "¿Cómo te sientes con tu progreso hoy?",
            "¿Necesitas ayuda con alguna comida específica?"
        ],
        "context_used": {
            "user_profile": {...},
            "today_nutrition": {...},
            "current_context": {...}
        }
    }
}
```

#### **Obtener Historial de Conversaciones**
```http
GET /api/chat/conversations?per_page=20&sentiment=positive
Authorization: Bearer {token}
```

#### **Obtener Conversación de Sesión**
```http
GET /api/chat/session/{sessionId}
Authorization: Bearer {token}
```

#### **Crear Nueva Sesión**
```http
POST /api/chat/session
Authorization: Bearer {token}
```

### **Estadísticas y Análisis**

#### **Estadísticas de Conversación**
```http
GET /api/chat/stats?days=30
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
    "success": true,
    "data": {
        "stats": {
            "total_messages": 45,
            "total_sessions": 12,
            "avg_confidence": 0.78,
            "positive_messages": 28,
            "negative_messages": 8,
            "stressed_messages": 5,
            "neutral_messages": 4
        },
        "patterns": [...],
        "popular_suggestions": [...]
    }
}
```

#### **Sugerencias Populares**
```http
GET /api/chat/suggestions?limit=10
Authorization: Bearer {token}
```

#### **Contexto del Usuario**
```http
GET /api/chat/context
Authorization: Bearer {token}
```

## 🎨 Tipos de Mensaje

El sistema soporta diferentes tipos de mensaje para mejor contextualización:

- **`general`** - Conversación general
- **`nutrition`** - Consultas nutricionales específicas
- **`exercise`** - Preguntas sobre ejercicios
- **`emotional`** - Apoyo emocional
- **`social`** - Situaciones sociales
- **`progress`** - Consultas sobre progreso

## 🧠 Análisis de Sentimiento

El sistema analiza automáticamente el sentimiento de cada mensaje:

### **Tipos de Sentimiento:**
- **`positive`** - Mensajes positivos y motivacionales
- **`negative`** - Mensajes con frustración o dificultades
- **`stressed`** - Mensajes que indican estrés o ansiedad
- **`neutral`** - Mensajes informativos o neutros

### **Confianza del Análisis:**
- Rango de 0.0 a 1.0
- Valores más altos indican mayor certeza en el análisis

## 🔄 Flujo de Conversación

### **1. Usuario envía mensaje**
```javascript
const response = await fetch('/api/chat/send', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        message: 'Tengo muchos antojos hoy',
        message_type: 'emotional'
    })
});
```

### **2. Sistema procesa con Gemini**
- Analiza contexto del usuario
- Prepara prompt personalizado
- Envía a Gemini API
- Analiza sentimiento del mensaje
- Genera sugerencias de seguimiento

### **3. Respuesta contextual**
- Respuesta personalizada de Gemini
- Análisis de sentimiento
- Sugerencias de seguimiento
- Contexto utilizado

### **4. Almacenamiento**
- Guarda conversación en base de datos
- Actualiza estadísticas
- Mantiene historial por sesión

## 📱 Implementación en App Móvil

### **Ejemplo de Chat Interface**

```javascript
class NutriCoachChat {
    constructor(apiToken) {
        this.token = apiToken;
        this.sessionId = null;
    }

    async sendMessage(message, type = 'general') {
        const response = await fetch('/api/chat/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                session_id: this.sessionId,
                message_type: type
            })
        });

        const data = await response.json();
        
        if (data.success) {
            this.sessionId = data.data.session_id;
            return data.data;
        }
        
        throw new Error(data.message);
    }

    async getConversationHistory() {
        const response = await fetch('/api/chat/conversations', {
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });

        return response.json();
    }

    async createNewSession() {
        const response = await fetch('/api/chat/session', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });

        const data = await response.json();
        if (data.success) {
            this.sessionId = data.data.session_id;
        }
        
        return data;
    }
}

// Uso
const chat = new NutriCoachChat(userToken);
await chat.createNewSession();

const response = await chat.sendMessage('¿Cómo voy con mi progreso?', 'progress');
console.log(response.ai_response);
console.log(response.follow_up_suggestions);
```

## 🎯 Casos de Uso

### **1. Consulta Nutricional**
```
Usuario: "¿Estoy bien con mis proteínas hoy?"
Gemini: "Veo que has consumido 85g de proteína de tu objetivo de 120g. Te faltan 35g. ¿Te gustaría que te sugiera algunas opciones ricas en proteína para completar tu día?"
```

### **2. Apoyo Emocional**
```
Usuario: "Estoy muy estresado y quiero comer dulces"
Gemini: "Entiendo que estés pasando por un momento difícil. El estrés puede generar antojos de dulces. ¿Te gustaría que activemos algunas estrategias para manejar este antojo de forma saludable?"
```

### **3. Situación Social**
```
Usuario: "Tengo una cena en un restaurante mañana"
Gemini: "Las situaciones sociales pueden ser desafiantes. Te sugiero revisar el menú antes de ir, pedir aderezos aparte y enfocarte en disfrutar la compañía. ¿Quieres que te prepare un plan específico?"
```

### **4. Seguimiento de Progreso**
```
Usuario: "¿Cómo voy esta semana?"
Gemini: "Esta semana has mantenido una adherencia del 78% a tus objetivos. Has tenido 5 días verdes y 2 amarillos. Tu tendencia es positiva. ¿Qué te gustaría mejorar para la próxima semana?"
```

## 🔒 Seguridad y Privacidad

### **Protección de Datos**
- Todas las conversaciones se almacenan localmente
- Los datos se envían a Gemini de forma segura
- No se comparten datos personales con terceros
- Cumplimiento con políticas de privacidad

### **Rate Limiting**
- Límites de mensajes por usuario
- Protección contra spam
- Monitoreo de uso anormal

## 📊 Monitoreo y Analytics

### **Métricas Disponibles**
- Total de mensajes por usuario
- Sentimiento promedio de conversaciones
- Tipos de consultas más frecuentes
- Patrones de uso por horario
- Efectividad de sugerencias

### **Dashboard de Administración**
- Estadísticas generales del sistema
- Usuarios más activos
- Patrones de conversación
- Alertas por sentimiento negativo

## 🚀 Próximas Mejoras

### **Funcionalidades Planificadas**
- **Integración con ejercicios** - Recomendaciones de ejercicios basadas en conversación
- **Recordatorios inteligentes** - Notificaciones contextuales
- **Análisis predictivo** - Predicción de comportamientos
- **Integración con wearables** - Datos de salud en tiempo real
- **Chat de voz** - Interacción por voz
- **Multimodal** - Soporte para imágenes y documentos

## 🛠️ Troubleshooting

### **Problemas Comunes**

#### **Error de API Key**
```
Error: API_ERROR
```
**Solución:** Verificar que `GEMINI_API_KEY` esté configurada correctamente en `.env`

#### **Respuesta vacía de Gemini**
```
Response: "Lo siento, no pude procesar tu mensaje."
```
**Solución:** Verificar conectividad y límites de la API de Gemini

#### **Contexto incompleto**
```
Context_used: null
```
**Solución:** Verificar que el usuario tenga perfil completo y datos nutricionales

### **Logs de Debugging**

Los logs se almacenan en `storage/logs/laravel.log`:

```bash
tail -f storage/logs/laravel.log | grep "Gemini"
```

## 📞 Soporte

Para problemas técnicos o preguntas sobre la integración:

1. Revisar logs de Laravel
2. Verificar configuración de variables de entorno
3. Probar endpoints con Postman/Insomnia
4. Contactar al equipo de desarrollo

---

**¡El sistema de chat con Gemini está listo para revolucionar la experiencia de coaching nutricional!** 🎉
