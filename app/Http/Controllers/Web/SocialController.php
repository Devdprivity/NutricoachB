<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Mail\NewFollowerMail;
use App\Models\Activity;
use App\Models\ActivityLike;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class SocialController extends Controller
{
    /**
     * Mostrar página social con feed
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Obtain user counts in one query using loadCount
        $user->loadCount(['followers', 'following', 'activities']);

        // Obtain feed — likes already eager-loaded so isLikedBy can check in-memory
        $activities = Activity::feedFor($user)
            ->with(['user:id,name,avatar', 'likes:id,activity_id,user_id'])
            ->recent()
            ->limit(50)
            ->get()
            ->map(function ($activity) use ($user) {
                return [
                    'id' => $activity->id,
                    'type' => $activity->type,
                    'description' => $activity->description,
                    'data' => $activity->data,
                    'image_url' => $activity->image_url,
                    'visibility' => $activity->visibility,
                    'likes_count' => $activity->likes_count,
                    'comments_count' => $activity->comments_count,
                    'is_liked' => $activity->likes->contains('user_id', $user->id),
                    'created_at' => $activity->created_at->toISOString(),
                    'user' => [
                        'id' => $activity->user->id,
                        'name' => $activity->user->name,
                        'avatar' => $activity->user->avatar,
                    ],
                ];
            });

        $stats = [
            'followers_count' => $user->followers_count,
            'following_count' => $user->following_count,
            'activities_count' => $user->activities_count,
        ];

        // Sugerencias de usuarios para seguir (usuarios con más seguidores que el usuario no sigue)
        $suggestedUsers = User::whereNotIn('id', $user->following()->pluck('following_id'))
            ->where('id', '!=', $user->id)
            ->withCount('followers')
            ->orderBy('followers_count', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($suggestedUser) {
                return [
                    'id' => $suggestedUser->id,
                    'name' => $suggestedUser->name,
                    'avatar' => $suggestedUser->avatar,
                    'followers_count' => $suggestedUser->followers_count,
                ];
            });

        return Inertia::render('social', [
            'activities' => $activities,
            'stats' => $stats,
            'suggested_users' => $suggestedUsers,
        ]);
    }

    /**
     * Seguir a un usuario
     */
    public function follow(Request $request, $userId)
    {
        $user = $request->user();
        $targetUser = User::findOrFail($userId);

        if ($user->id === $targetUser->id) {
            return response()->json(['error' => 'No puedes seguirte a ti mismo'], 400);
        }

        $user->follow($targetUser);

        // Enviar email de notificación al usuario seguido (COLA HIGH - urgente)
        try {
            Mail::to($targetUser->email)
                ->queue(new NewFollowerMail($targetUser, $user))
                ->onQueue('high');
            \Log::info('NewFollowerMail queued on HIGH priority', [
                'follower_id' => $user->id,
                'target_user_id' => $targetUser->id,
                'target_email' => $targetUser->email
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to queue NewFollowerMail: ' . $e->getMessage(), [
                'follower_id' => $user->id,
                'target_user_id' => $targetUser->id,
            ]);
        }

        return response()->json([
            'message' => 'Ahora sigues a '.$targetUser->name,
            'is_following' => true,
        ]);
    }

    /**
     * Dejar de seguir a un usuario
     */
    public function unfollow(Request $request, $userId)
    {
        $user = $request->user();
        $targetUser = User::findOrFail($userId);

        $user->unfollow($targetUser);

        return response()->json([
            'message' => 'Dejaste de seguir a '.$targetUser->name,
            'is_following' => false,
        ]);
    }

    /**
     * Obtener seguidores de un usuario
     */
    public function followers(Request $request, $userId)
    {
        $targetUser = User::findOrFail($userId);
        $currentUser = $request->user();

        $followersList = $targetUser->followers()->withCount('followers')->get();
        $followingIds = $currentUser->following()->pluck('following_id')->flip();

        $followers = $followersList->map(function ($follower) use ($followingIds) {
            return [
                'id' => $follower->id,
                'name' => $follower->name,
                'avatar' => $follower->avatar,
                'followers_count' => $follower->followers_count,
                'is_following' => $followingIds->has($follower->id),
            ];
        });

        return response()->json($followers);
    }

    /**
     * Obtener usuarios que sigue
     */
    public function following(Request $request, $userId)
    {
        $targetUser = User::findOrFail($userId);
        $currentUser = $request->user();

        $followingList = $targetUser->following()->withCount('followers')->get();
        $currentFollowingIds = $currentUser->following()->pluck('following_id')->flip();

        $following = $followingList->map(function ($followedUser) use ($currentFollowingIds) {
            return [
                'id' => $followedUser->id,
                'name' => $followedUser->name,
                'avatar' => $followedUser->avatar,
                'followers_count' => $followedUser->followers_count,
                'is_following' => $currentFollowingIds->has($followedUser->id),
            ];
        });

        return response()->json($following);
    }

    /**
     * Dar like a una actividad
     */
    public function likeActivity(Request $request, $activityId)
    {
        $user = $request->user();
        $activity = Activity::findOrFail($activityId);

        // Verificar si ya dio like
        $existingLike = ActivityLike::where('activity_id', $activityId)
            ->where('user_id', $user->id)
            ->first();

        if ($existingLike) {
            return response()->json(['error' => 'Ya diste like a esta actividad'], 400);
        }

        // Crear like
        ActivityLike::create([
            'activity_id' => $activityId,
            'user_id' => $user->id,
        ]);

        // Incrementar contador
        $activity->increment('likes_count');

        return response()->json([
            'message' => 'Like agregado',
            'likes_count' => $activity->fresh()->likes_count,
        ]);
    }

    /**
     * Quitar like de una actividad
     */
    public function unlikeActivity(Request $request, $activityId)
    {
        $user = $request->user();
        $activity = Activity::findOrFail($activityId);

        $like = ActivityLike::where('activity_id', $activityId)
            ->where('user_id', $user->id)
            ->first();

        if (!$like) {
            return response()->json(['error' => 'No has dado like a esta actividad'], 400);
        }

        $like->delete();

        // Decrementar contador
        $activity->decrement('likes_count');

        return response()->json([
            'message' => 'Like eliminado',
            'likes_count' => $activity->fresh()->likes_count,
        ]);
    }

    /**
     * Buscar usuarios
     */
    public function searchUsers(Request $request)
    {
        $query = $request->input('query');
        $currentUser = $request->user();

        if (!$query || strlen($query) < 2) {
            return response()->json([]);
        }

        $results = User::where('name', 'like', "%{$query}%")
            ->where('id', '!=', $currentUser->id)
            ->withCount('followers')
            ->limit(10)
            ->get();

        $followingIds = $currentUser->following()->pluck('following_id')->flip();

        $users = $results->map(function ($user) use ($followingIds) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'avatar' => $user->avatar,
                'followers_count' => $user->followers_count,
                'is_following' => $followingIds->has($user->id),
            ];
        });

        return response()->json($users);
    }

    /**
     * Obtener ranking de usuarios (leaderboard)
     */
    public function leaderboard(Request $request): Response
    {
        $currentUser = $request->user();
        $type = $request->input('type', 'followers'); // followers, activities, points

        $query = User::query();

        switch ($type) {
            case 'followers':
                $query->withCount('followers')->orderBy('followers_count', 'desc');
                break;
            case 'activities':
                $query->withCount('activities')->orderBy('activities_count', 'desc');
                break;
            default:
                $query->withCount('followers')->orderBy('followers_count', 'desc');
        }

        $topUsers = $query->limit(20)->get();
        $followingIds = $currentUser->following()->pluck('following_id')->flip();

        $topUsers = $topUsers->map(function ($user, $index) use ($currentUser, $followingIds) {
            return [
                'rank' => $index + 1,
                'id' => $user->id,
                'name' => $user->name,
                'avatar' => $user->avatar,
                'score' => $user->followers_count ?? $user->activities_count ?? 0,
                'is_following' => $followingIds->has($user->id),
                'is_current_user' => $user->id === $currentUser->id,
            ];
        });

        return Inertia::render('leaderboard', [
            'leaderboard' => $topUsers,
            'type' => $type,
        ]);
    }
}
