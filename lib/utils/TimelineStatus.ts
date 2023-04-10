enum TimelineStatus {
    REJECTED = 'REJECTED',
    ACCEPTED = 'ACCEPTED',
    RUNNING = 'RUNNING',
}

namespace TimelineStatus {
    export function toEmoji(status: TimelineStatus) {
        switch (status) {
            case TimelineStatus.REJECTED:
                return '❌';
            case TimelineStatus.ACCEPTED:
                return '✔';
            case TimelineStatus.RUNNING:
                return '🏃‍♂️';
        }
    }
}

export default TimelineStatus;
